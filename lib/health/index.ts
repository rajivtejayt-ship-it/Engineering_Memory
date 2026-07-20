import type {
  RepositoryCommit,
  RepositoryEvidenceData,
  RepositoryIssue,
  RepositoryPullRequest,
} from "@/lib/retriever";
import type { RepositoryContext } from "@/lib/types";

/** File-level health data derived from repository history. */
export interface FileHealth {
  /** Repository-relative file path. */
  path: string;
  /** Number of observed commits that changed the file. */
  modificationCount: number;
  /** Most recent observed modification timestamp, when available. */
  lastModifiedAt?: string;
  /** Deterministic risk score on a 0–1 scale. */
  riskScore: number;
  /** Source IDs that explain the file's health classification. */
  sourceIds: string[];
}

/** A deterministic maintenance or architecture risk identified in the history. */
export interface ArchitectureRisk {
  /** Stable risk identifier. */
  id: string;
  /** Severity derived from deterministic thresholds. */
  severity: "low" | "medium" | "high";
  /** Concise description of the observed risk signal. */
  summary: string;
  /** Files associated with the risk. */
  filePaths: string[];
  /** Source IDs supporting the finding. */
  sourceIds: string[];
}

/** Health findings calculated from normalized repository API data. */
export interface RepositoryHealthSummary {
  /** Repository context used for the analysis. */
  repositoryContext: RepositoryContext;
  /** Highest-churn files observed in commit history. */
  hotspotFiles: FileHealth[];
  /** Files linked to bug, regression, or failure evidence. */
  riskyFiles: FileHealth[];
  /** Files changed repeatedly in the observed history. */
  frequentlyModifiedFiles: FileHealth[];
  /** Files not changed within the stale-history threshold. */
  staleFiles: FileHealth[];
  /** Repository-level risks inferred from deterministic history signals. */
  architectureRisks: ArchitectureRisk[];
}

const MAX_HOTSPOT_FILES = 5;
const MAX_FREQUENT_FILES = 10;
const STALE_HISTORY_DAYS = 180;
const RISK_KEYWORDS = /\b(bug|fix|error|failure|regression|incident|security)\b/i;

interface MutableFileHealth {
  modificationCount: number;
  latestTimestamp?: number;
  latestOccurredAt?: string;
  sourceIds: Set<string>;
  riskSourceIds: Set<string>;
}

/**
 * Analyzes normalized repository history without contacting an AI model or
 * repository provider. Missing collections produce empty, valid result groups.
 */
export function analyzeRepositoryHealth(
  repositoryContext: RepositoryContext,
  repositoryData: RepositoryEvidenceData,
): RepositoryHealthSummary {
  const commits = repositoryData.commits ?? [];
  const pullRequests = repositoryData.pullRequests ?? [];
  const issues = repositoryData.issues ?? [];
  const fileHealthByPath = collectFileHealth(commits, pullRequests, issues);
  const files = [...fileHealthByPath.entries()]
    .map(([path, health]) => toFileHealth(path, health, commits.length))
    .sort(
      (left, right) =>
        right.modificationCount - left.modificationCount ||
        right.riskScore - left.riskScore ||
        left.path.localeCompare(right.path),
    );
  const latestRepositoryTimestamp = getLatestRepositoryTimestamp(commits);
  const staleCutoff =
    latestRepositoryTimestamp === undefined
      ? undefined
      : latestRepositoryTimestamp - STALE_HISTORY_DAYS * 24 * 60 * 60 * 1_000;

  const hotspotFiles = files.slice(0, MAX_HOTSPOT_FILES);
  const riskyFiles = files.filter((file) => file.riskScore >= 0.35);
  const frequentlyModifiedFiles = files
    .filter((file) => file.modificationCount >= 2)
    .slice(0, MAX_FREQUENT_FILES);
  const staleFiles =
    staleCutoff === undefined
      ? []
      : files.filter((file) => {
          const timestamp = file.lastModifiedAt
            ? Date.parse(file.lastModifiedAt)
            : Number.NaN;
          return Number.isFinite(timestamp) && timestamp < staleCutoff;
        });

  return {
    repositoryContext,
    hotspotFiles,
    riskyFiles,
    frequentlyModifiedFiles,
    staleFiles,
    architectureRisks: buildArchitectureRisks(
      hotspotFiles,
      riskyFiles,
      repositoryData.documentation?.length ?? 0,
    ),
  };
}

function collectFileHealth(
  commits: RepositoryCommit[],
  pullRequests: RepositoryPullRequest[],
  issues: RepositoryIssue[],
): Map<string, MutableFileHealth> {
  const fileHealthByPath = new Map<string, MutableFileHealth>();
  const pullRequestsByCommitId = new Map<string, RepositoryPullRequest[]>();
  const issuesByCommitId = new Map<string, RepositoryIssue[]>();

  for (const pullRequest of pullRequests) {
    for (const commitId of pullRequest.commitIds) {
      const linkedPullRequests = pullRequestsByCommitId.get(commitId) ?? [];
      linkedPullRequests.push(pullRequest);
      pullRequestsByCommitId.set(commitId, linkedPullRequests);
    }
  }
  for (const issue of issues) {
    for (const commitId of issue.relatedCommitIds ?? []) {
      const linkedIssues = issuesByCommitId.get(commitId) ?? [];
      linkedIssues.push(issue);
      issuesByCommitId.set(commitId, linkedIssues);
    }
  }

  for (const commit of commits) {
    const commitSourceId = `commit:${commit.id}`;
    const linkedPullRequests = pullRequestsByCommitId.get(commit.id) ?? [];
    const linkedIssues = issuesByCommitId.get(commit.id) ?? [];
    const isRiskRelated =
      RISK_KEYWORDS.test(commit.message) ||
      linkedPullRequests.some((pullRequest) =>
        RISK_KEYWORDS.test(`${pullRequest.title} ${pullRequest.summary}`),
      ) ||
      linkedIssues.some((issue) =>
        RISK_KEYWORDS.test(
          `${issue.title} ${issue.summary} ${issue.labels.join(" ")}`,
        ),
      );

    for (const path of commit.files) {
      const health = fileHealthByPath.get(path) ?? {
        modificationCount: 0,
        sourceIds: new Set<string>(),
        riskSourceIds: new Set<string>(),
      };
      health.modificationCount += 1;
      health.sourceIds.add(commitSourceId);
      updateLatestModification(health, commit.authoredAt);

      if (isRiskRelated) {
        health.riskSourceIds.add(commitSourceId);
        for (const pullRequest of linkedPullRequests) {
          health.riskSourceIds.add(`pull-request:${pullRequest.number}`);
        }
        for (const issue of linkedIssues) {
          health.riskSourceIds.add(`issue:${issue.number}`);
        }
      }

      fileHealthByPath.set(path, health);
    }
  }

  return fileHealthByPath;
}

function updateLatestModification(
  health: MutableFileHealth,
  occurredAt: string,
): void {
  const timestamp = Date.parse(occurredAt);
  if (!Number.isFinite(timestamp)) {
    return;
  }

  if (
    health.latestTimestamp === undefined ||
    timestamp > health.latestTimestamp
  ) {
    health.latestTimestamp = timestamp;
    health.latestOccurredAt = occurredAt;
  }
}

function toFileHealth(
  path: string,
  health: MutableFileHealth,
  commitCount: number,
): FileHealth {
  const modificationScore = health.modificationCount / Math.max(commitCount, 1);
  const riskSignalScore = health.riskSourceIds.size > 0 ? 0.6 : 0;

  return {
    path,
    modificationCount: health.modificationCount,
    lastModifiedAt: health.latestOccurredAt,
    riskScore: round(clamp(modificationScore * 0.4 + riskSignalScore, 0, 1)),
    sourceIds: [...new Set([...health.sourceIds, ...health.riskSourceIds])].sort(),
  };
}

function getLatestRepositoryTimestamp(
  commits: RepositoryCommit[],
): number | undefined {
  const timestamps = commits
    .map((commit) => Date.parse(commit.authoredAt))
    .filter((timestamp) => Number.isFinite(timestamp));

  return timestamps.length > 0 ? Math.max(...timestamps) : undefined;
}

function buildArchitectureRisks(
  hotspotFiles: FileHealth[],
  riskyFiles: FileHealth[],
  documentationCount: number,
): ArchitectureRisk[] {
  const risks: ArchitectureRisk[] = [];
  const highChurnFiles = hotspotFiles.filter((file) => file.modificationCount >= 3);

  if (highChurnFiles.length > 0) {
    risks.push({
      id: "high-change-frequency",
      severity: highChurnFiles.some((file) => file.modificationCount >= 5)
        ? "high"
        : "medium",
      summary:
        "Repeated changes in these files indicate concentrated maintenance churn.",
      filePaths: highChurnFiles.map((file) => file.path),
      sourceIds: [...new Set(highChurnFiles.flatMap((file) => file.sourceIds))].sort(),
    });
  }
  if (riskyFiles.length > 0) {
    risks.push({
      id: "bug-linked-files",
      severity: riskyFiles.some((file) => file.riskScore >= 0.75)
        ? "high"
        : "medium",
      summary:
        "These files are linked to bug, failure, regression, or security-related history.",
      filePaths: riskyFiles.map((file) => file.path),
      sourceIds: [...new Set(riskyFiles.flatMap((file) => file.sourceIds))].sort(),
    });
  }
  if (documentationCount === 0 && hotspotFiles.length > 0) {
    risks.push({
      id: "missing-documentation-for-hotspots",
      severity: "low",
      summary:
        "No documentation records were supplied for a repository with observed change hotspots.",
      filePaths: hotspotFiles.map((file) => file.path),
      sourceIds: [...new Set(hotspotFiles.flatMap((file) => file.sourceIds))].sort(),
    });
  }

  return risks;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
