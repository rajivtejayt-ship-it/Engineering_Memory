import type { RetrievalResult } from "@/lib/retriever";

/** Deterministic severity used by code-risk findings. */
export type RiskSeverity = "low" | "medium" | "high";

/** A file likely to be affected by a change to the queried code. */
export interface AffectedFileRisk {
  /** Repository-relative file path. */
  path: string;
  /** Deterministic likelihood score on a 0–1 scale. */
  score: number;
  /** Evidence-backed signals that contributed to the score. */
  reasons: string[];
  /** Supporting commit, PR, or issue source IDs. */
  sourceIds: string[];
}

/** A co-change relationship that may represent a dependency risk. */
export interface DependencyRisk {
  /** File at the center of the potential dependency. */
  filePath: string;
  /** Files repeatedly changed with the central file. */
  relatedFiles: string[];
  /** Deterministic severity based on observed evidence. */
  severity: RiskSeverity;
  /** Concise, evidence-backed dependency-risk explanation. */
  summary: string;
  /** Supporting source IDs. */
  sourceIds: string[];
}

/** A deterministic architecture-level maintenance risk. */
export interface ArchitecturalRisk {
  /** Stable risk identifier. */
  id: string;
  /** Deterministic severity. */
  severity: RiskSeverity;
  /** Concise, evidence-backed risk explanation. */
  summary: string;
  /** Files involved in the risk. */
  filePaths: string[];
  /** Supporting source IDs. */
  sourceIds: string[];
}

/** A bug, regression, or failure recorded in the supplied repository evidence. */
export interface HistoricalRegression {
  /** Stable source-backed regression identifier. */
  id: string;
  /** Concise regression description from a source record. */
  summary: string;
  /** Source event timestamp, when available. */
  occurredAt?: string;
  /** Deterministic severity inferred from source keywords. */
  severity: RiskSeverity;
  /** Supporting source IDs. */
  sourceIds: string[];
}

/** Complete deterministic risk analysis returned to dashboard or API consumers. */
export interface RiskAnalysis {
  /** Files likely to be affected by changes to the requested target. */
  likelyAffectedFiles: AffectedFileRisk[];
  /** Observed co-change relationships that may create dependency risk. */
  dependencyRisks: DependencyRisk[];
  /** Observed churn and architecture-decision risks. */
  architecturalRisks: ArchitecturalRisk[];
  /** Historically recorded bug and regression evidence. */
  historicalRegressions: HistoricalRegression[];
}

interface MutableFileRisk {
  directTargetChanges: number;
  relatedChanges: number;
  riskChanges: number;
  sourceIds: Set<string>;
  reasons: Set<string>;
}

const REGRESSION_PATTERN =
  /\b(bug|regression|failure|incident|outage|security|vulnerability|error)\b/i;
const CRITICAL_PATTERN =
  /\b(critical|security|outage|data loss|vulnerability)\b/i;
const ARCHITECTURE_PATTERN =
  /\b(adr|architecture|architectural|decision|design|boundary|migration)\b/i;

/**
 * Produces deterministic risk findings from already retrieved repository
 * evidence. It does not call Gemini and never claims a runtime dependency
 * where the history shows only co-change evidence.
 */
export function analyzeCodeRisks(retrievalResult: RetrievalResult): RiskAnalysis {
  const targetFile = retrievalResult.repositoryContext.filePath;
  const commits = retrievalResult.commits.map((item) => item.item);
  const pullRequests = retrievalResult.pullRequests.map((item) => item.item);
  const issues = retrievalResult.issues.map((item) => item.item);
  const documentation = retrievalResult.documentation.map((item) => item.item);
  const fileRisks = collectFileRisks(commits, targetFile);

  return {
    likelyAffectedFiles: toAffectedFileRisks(fileRisks, commits.length),
    dependencyRisks: buildDependencyRisks(fileRisks, targetFile),
    architecturalRisks: buildArchitecturalRisks(
      fileRisks,
      commits,
      pullRequests,
      documentation,
    ),
    historicalRegressions: buildHistoricalRegressions(
      commits,
      pullRequests,
      issues,
    ),
  };
}

function collectFileRisks(
  commits: RetrievalResult["commits"][number]["item"][],
  targetFile: string | undefined,
): Map<string, MutableFileRisk> {
  const fileRisks = new Map<string, MutableFileRisk>();

  for (const commit of commits) {
    const commitSourceId = `commit:${commit.id}`;
    const touchesTarget = targetFile ? commit.files.includes(targetFile) : false;
    const isRegression = REGRESSION_PATTERN.test(commit.message);

    for (const filePath of commit.files) {
      const fileRisk = fileRisks.get(filePath) ?? {
        directTargetChanges: 0,
        relatedChanges: 0,
        riskChanges: 0,
        sourceIds: new Set<string>(),
        reasons: new Set<string>(),
      };
      fileRisk.sourceIds.add(commitSourceId);

      if (filePath === targetFile) {
        fileRisk.directTargetChanges += 1;
        fileRisk.reasons.add("Directly matches the requested file.");
      } else if (touchesTarget) {
        fileRisk.relatedChanges += 1;
        fileRisk.reasons.add("Changed in the same commit as the requested file.");
      }
      if (isRegression) {
        fileRisk.riskChanges += 1;
        fileRisk.reasons.add("Changed in a commit with bug or regression signals.");
      }

      fileRisks.set(filePath, fileRisk);
    }
  }

  return fileRisks;
}

function toAffectedFileRisks(
  fileRisks: Map<string, MutableFileRisk>,
  observedCommitCount: number,
): AffectedFileRisk[] {
  return [...fileRisks.entries()]
    .map(([path, risk]) => {
      const score = clamp(
        risk.directTargetChanges * 0.5 +
          risk.relatedChanges * 0.25 +
          risk.riskChanges * 0.15 +
          risk.sourceIds.size / Math.max(observedCommitCount, 1) * 0.1,
        0,
        1,
      );

      return {
        path,
        score: round(score),
        reasons: [...risk.reasons],
        sourceIds: [...risk.sourceIds].sort(),
      };
    })
    .filter((file) => file.score > 0)
    .sort((left, right) => right.score - left.score || left.path.localeCompare(right.path));
}

function buildDependencyRisks(
  fileRisks: Map<string, MutableFileRisk>,
  targetFile: string | undefined,
): DependencyRisk[] {
  if (!targetFile) {
    return [];
  }

  const relatedFiles = [...fileRisks.entries()]
    .filter(([path, risk]) => path !== targetFile && risk.relatedChanges > 0)
    .sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath));

  if (relatedFiles.length === 0) {
    return [];
  }

  const sourceIds = [
    ...new Set(relatedFiles.flatMap(([, risk]) => [...risk.sourceIds])),
  ].sort();
  const severity: RiskSeverity =
    relatedFiles.length >= 3 ? "high" : relatedFiles.length >= 2 ? "medium" : "low";

  return [
    {
      filePath: targetFile,
      relatedFiles: relatedFiles.map(([path]) => path),
      severity,
      summary:
        "These files co-changed with the requested file in the supplied commit history; this indicates a possible dependency or coordinated-change risk, not a proven runtime dependency.",
      sourceIds,
    },
  ];
}

function buildArchitecturalRisks(
  fileRisks: Map<string, MutableFileRisk>,
  commits: RetrievalResult["commits"][number]["item"][],
  pullRequests: RetrievalResult["pullRequests"][number]["item"][],
  documentation: RetrievalResult["documentation"][number]["item"][],
): ArchitecturalRisk[] {
  const risks: ArchitecturalRisk[] = [];
  const highChurnFiles = [...fileRisks.entries()]
    .filter(([, risk]) => risk.sourceIds.size >= 2)
    .map(([path]) => path)
    .sort();

  if (highChurnFiles.length > 0) {
    risks.push({
      id: "architecture:concentrated-churn",
      severity: highChurnFiles.length >= 3 ? "high" : "medium",
      summary:
        "Repeated changes in these files indicate concentrated maintenance churn.",
      filePaths: highChurnFiles,
      sourceIds: commits
        .filter((commit) => commit.files.some((file) => highChurnFiles.includes(file)))
        .map((commit) => `commit:${commit.id}`)
        .sort(),
    });
  }

  const architectureSources = [
    ...documentation
      .filter((document) =>
        ARCHITECTURE_PATTERN.test(
          `${document.path} ${document.title} ${document.summary}`,
        ),
      )
      .map((document) => `documentation:${document.path}`),
    ...pullRequests
      .filter((pullRequest) =>
        ARCHITECTURE_PATTERN.test(
          `${pullRequest.title} ${pullRequest.summary}`,
        ),
      )
      .map((pullRequest) => `pull-request:${pullRequest.number}`),
  ];

  if (architectureSources.length > 0 && highChurnFiles.length > 0) {
    risks.push({
      id: "architecture:decision-churn",
      severity: "medium",
      summary:
        "Architecture-decision evidence overlaps a high-change area; review the decision history before modifying these files.",
      filePaths: highChurnFiles,
      sourceIds: [...new Set(architectureSources)].sort(),
    });
  }

  return risks;
}

function buildHistoricalRegressions(
  commits: RetrievalResult["commits"][number]["item"][],
  pullRequests: RetrievalResult["pullRequests"][number]["item"][],
  issues: RetrievalResult["issues"][number]["item"][],
): HistoricalRegression[] {
  return [
    ...issues
      .filter((issue) =>
        REGRESSION_PATTERN.test(
          `${issue.title} ${issue.summary} ${issue.labels.join(" ")}`,
        ),
      )
      .map((issue) => ({
        id: `regression:issue:${issue.number}`,
        summary: `Issue #${issue.number}: ${issue.title}`,
        occurredAt: issue.createdAt,
        severity: getSeverity(`${issue.title} ${issue.summary}`),
        sourceIds: [`issue:${issue.number}`],
      })),
    ...pullRequests
      .filter((pullRequest) =>
        REGRESSION_PATTERN.test(
          `${pullRequest.title} ${pullRequest.summary}`,
        ),
      )
      .map((pullRequest) => ({
        id: `regression:pull-request:${pullRequest.number}`,
        summary: `PR #${pullRequest.number}: ${pullRequest.title}`,
        occurredAt: pullRequest.mergedAt ?? pullRequest.createdAt,
        severity: getSeverity(`${pullRequest.title} ${pullRequest.summary}`),
        sourceIds: [`pull-request:${pullRequest.number}`],
      })),
    ...commits
      .filter((commit) => REGRESSION_PATTERN.test(commit.message))
      .map((commit) => ({
        id: `regression:commit:${commit.id}`,
        summary: `Commit ${commit.id}: ${commit.message}`,
        occurredAt: commit.authoredAt,
        severity: getSeverity(commit.message),
        sourceIds: [`commit:${commit.id}`],
      })),
  ].sort(
    (left, right) =>
      getTimestamp(left.occurredAt) - getTimestamp(right.occurredAt) ||
      left.id.localeCompare(right.id),
  );
}

function getSeverity(value: string): RiskSeverity {
  return CRITICAL_PATTERN.test(value)
    ? "high"
    : REGRESSION_PATTERN.test(value)
      ? "medium"
      : "low";
}

function getTimestamp(occurredAt: string | undefined): number {
  const timestamp = occurredAt ? Date.parse(occurredAt) : Number.NaN;
  return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
