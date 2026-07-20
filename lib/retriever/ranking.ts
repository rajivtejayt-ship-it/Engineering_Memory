import type { QuestionType } from "@/lib/constants";
import type { RepositoryContext } from "@/lib/types";
import type {
  RankedEvidence,
  RepositoryCommit,
  RepositoryDocumentation,
  RepositoryEvidenceData,
  RepositoryIssue,
  RepositoryPullRequest,
} from ".";

/** Relative contribution of each deterministic ranking signal. */
/** Public deterministic weights used when calculating evidence relevance. */
export const EVIDENCE_RANKING_WEIGHTS = {
  sameFile: 0.4,
  sameFolder: 0.15,
  issueReference: 0.15,
  pullRequestReference: 0.15,
  recency: 0.05,
  modificationFrequency: 0.1,
} as const;

/** Ranked evidence grouped by the repository record type. */
export interface EvidenceRankingResult {
  commits: RankedEvidence<RepositoryCommit>[];
  pullRequests: RankedEvidence<RepositoryPullRequest>[];
  issues: RankedEvidence<RepositoryIssue>[];
  documentation: RankedEvidence<RepositoryDocumentation>[];
}

/**
 * Deterministically ranks normalized repository evidence. It never contacts a
 * model or a repository provider; callers supply already-normalized API data.
 */
export class EvidenceRankingEngine {
  rank(
    repositoryContext: RepositoryContext,
    repositoryData: RepositoryEvidenceData,
    questionType: QuestionType,
  ): EvidenceRankingResult {
    // Ranking uses repository relationships only; retain this argument so the
    // retriever contract can evolve without changing the orchestration layer.
    void questionType;
    const commits = repositoryData.commits ?? [];
    const pullRequests = repositoryData.pullRequests ?? [];
    const issues = repositoryData.issues ?? [];
    const documentation = repositoryData.documentation ?? [];
    const targetFile = repositoryContext.filePath;
    const targetFolder = getFolder(targetFile);
    const fileModificationCounts = getFileModificationCounts(commits);
    const maxModificationCount = Math.max(
      1,
      ...Array.from(fileModificationCounts.values()),
    );
    const targetCommitIds = new Set(
      targetFile
        ? commits
            .filter((commit) => commit.files.includes(targetFile))
            .map((commit) => commit.id)
        : [],
    );
    const targetPullRequestNumbers = new Set(
      pullRequests
        .filter(
          (pullRequest) =>
            pullRequest.files?.includes(targetFile ?? "") ||
            pullRequest.commitIds.some((id) => targetCommitIds.has(id)),
        )
        .map((pullRequest) => pullRequest.number),
    );
    const targetIssueNumbers = new Set<number>();

    for (const commit of commits) {
      if (targetCommitIds.has(commit.id)) {
        addNumbers(targetIssueNumbers, commit.issueNumbers);
      }
    }
    for (const pullRequest of pullRequests) {
      if (targetPullRequestNumbers.has(pullRequest.number)) {
        addNumbers(targetIssueNumbers, pullRequest.issueNumbers);
      }
    }
    for (const issue of issues) {
      if (
        issue.relatedCommitIds?.some((id) => targetCommitIds.has(id)) ||
        (issue.pullRequestNumber !== undefined &&
          targetPullRequestNumbers.has(issue.pullRequestNumber))
      ) {
        targetIssueNumbers.add(issue.number);
      }
    }

    const timestamps = [
      ...commits.map((commit) => commit.authoredAt),
      ...pullRequests.map((pullRequest) => pullRequest.mergedAt ?? pullRequest.createdAt),
      ...issues.map((issue) => issue.createdAt),
      ...documentation.map((document) => document.updatedAt),
    ];
    const recencyRange = getRecencyRange(timestamps);

    return {
      commits: commits.map((commit) =>
        this.rankItem(
          commit,
          commit.files,
          commit.issueNumbers,
          commit.pullRequestNumber,
          commit.authoredAt,
          targetFile,
          targetFolder,
          targetIssueNumbers,
          targetPullRequestNumbers,
          fileModificationCounts,
          maxModificationCount,
          recencyRange,
        ),
      ),
      pullRequests: pullRequests.map((pullRequest) =>
        this.rankItem(
          pullRequest,
          pullRequest.files ?? [],
          pullRequest.issueNumbers,
          pullRequest.number,
          pullRequest.mergedAt ?? pullRequest.createdAt,
          targetFile,
          targetFolder,
          targetIssueNumbers,
          targetPullRequestNumbers,
          fileModificationCounts,
          maxModificationCount,
          recencyRange,
        ),
      ),
      issues: issues.map((issue) =>
        this.rankItem(
          issue,
          getFilesForCommitIds(issue.relatedCommitIds, commits),
          [issue.number],
          issue.pullRequestNumber,
          issue.createdAt,
          targetFile,
          targetFolder,
          targetIssueNumbers,
          targetPullRequestNumbers,
          fileModificationCounts,
          maxModificationCount,
          recencyRange,
        ),
      ),
      documentation: documentation.map((document) =>
        this.rankItem(
          document,
          [document.path],
          [],
          undefined,
          document.updatedAt,
          targetFile,
          targetFolder,
          targetIssueNumbers,
          targetPullRequestNumbers,
          fileModificationCounts,
          maxModificationCount,
          recencyRange,
        ),
      ),
    };
  }

  private rankItem<T>(
    item: T,
    filePaths: string[],
    issueNumbers: number[] | undefined,
    pullRequestNumber: number | undefined,
    occurredAt: string | undefined,
    targetFile: string | undefined,
    targetFolder: string | undefined,
    targetIssueNumbers: Set<number>,
    targetPullRequestNumbers: Set<number>,
    fileModificationCounts: Map<string, number>,
    maxModificationCount: number,
    recencyRange: { oldest: number; newest: number } | undefined,
  ): RankedEvidence<T> {
    const reasons: string[] = [];
    let score = 0;

    if (targetFile && filePaths.includes(targetFile)) {
      score += EVIDENCE_RANKING_WEIGHTS.sameFile;
      reasons.push(`Modifies the same file: ${targetFile}.`);
    } else if (
      targetFolder &&
      filePaths.some((filePath) => getFolder(filePath) === targetFolder)
    ) {
      score += EVIDENCE_RANKING_WEIGHTS.sameFolder;
      reasons.push(`Modifies a file in the same folder: ${targetFolder}.`);
    }

    if (issueNumbers?.some((number) => targetIssueNumbers.has(number))) {
      score += EVIDENCE_RANKING_WEIGHTS.issueReference;
      reasons.push("References an issue connected to the target file.");
    }

    if (
      pullRequestNumber !== undefined &&
      targetPullRequestNumbers.has(pullRequestNumber)
    ) {
      score += EVIDENCE_RANKING_WEIGHTS.pullRequestReference;
      reasons.push("References a pull request connected to the target file.");
    }

    const recencyScore = getRecencyScore(occurredAt, recencyRange);
    if (recencyScore > 0) {
      score += recencyScore * EVIDENCE_RANKING_WEIGHTS.recency;
      reasons.push("Receives a deterministic recency score.");
    }

    const frequencyScore = getFrequencyScore(
      filePaths,
      fileModificationCounts,
      maxModificationCount,
    );
    if (frequencyScore > 0) {
      score +=
        frequencyScore * EVIDENCE_RANKING_WEIGHTS.modificationFrequency;
      reasons.push("Touches frequently modified repository files.");
    }

    return { item, score: Math.min(score, 1), reasons };
  }
}

function getFolder(filePath: string | undefined): string | undefined {
  if (!filePath || !filePath.includes("/")) {
    return undefined;
  }

  return filePath.slice(0, filePath.lastIndexOf("/"));
}

function addNumbers(target: Set<number>, values: number[] | undefined): void {
  for (const value of values ?? []) {
    target.add(value);
  }
}

function getFileModificationCounts(commits: RepositoryCommit[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const commit of commits) {
    for (const filePath of commit.files) {
      counts.set(filePath, (counts.get(filePath) ?? 0) + 1);
    }
  }

  return counts;
}

function getFilesForCommitIds(
  commitIds: string[] | undefined,
  commits: RepositoryCommit[],
): string[] {
  const ids = new Set(commitIds ?? []);
  return commits
    .filter((commit) => ids.has(commit.id))
    .flatMap((commit) => commit.files);
}

function getRecencyRange(
  timestamps: Array<string | undefined>,
): { oldest: number; newest: number } | undefined {
  const parsed = timestamps
    .map((timestamp) => (timestamp ? Date.parse(timestamp) : Number.NaN))
    .filter((timestamp) => Number.isFinite(timestamp));

  if (parsed.length === 0) {
    return undefined;
  }

  return { oldest: Math.min(...parsed), newest: Math.max(...parsed) };
}

function getRecencyScore(
  occurredAt: string | undefined,
  range: { oldest: number; newest: number } | undefined,
): number {
  const timestamp = occurredAt ? Date.parse(occurredAt) : Number.NaN;
  if (!range || !Number.isFinite(timestamp)) {
    return 0;
  }

  if (range.oldest === range.newest) {
    return 1;
  }

  return (timestamp - range.oldest) / (range.newest - range.oldest);
}

function getFrequencyScore(
  filePaths: string[],
  fileModificationCounts: Map<string, number>,
  maxModificationCount: number,
): number {
  const highestCount = Math.max(
    0,
    ...filePaths.map((filePath) => fileModificationCounts.get(filePath) ?? 0),
  );

  return highestCount / maxModificationCount;
}
