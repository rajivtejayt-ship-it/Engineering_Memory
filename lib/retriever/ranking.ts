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

const SEMANTIC_FALLBACK_MAX_SCORE = 0.4;

const QUESTION_TYPE_TERMS: Record<QuestionType, readonly string[]> = {
  WHY_INTRODUCED: ["introduce", "introduced", "add", "added", "create", "created"],
  WHY_CHANGED: ["change", "changed", "update", "updated", "modify", "modified"],
  BREAKAGE: ["break", "broken", "failure", "fail", "bug", "regression", "fix"],
  RELEVANCE: ["relevant", "relevance", "impact", "dependency", "depend"],
  UNKNOWN: [],
};

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "does", "for", "from",
  "how", "in", "is", "it", "of", "on", "or", "that", "the", "this", "to",
  "was", "what", "when", "which", "who", "why", "with",
]);

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
  constructor(private readonly questionText = "") {}

  rank(
    repositoryContext: RepositoryContext,
    repositoryData: RepositoryEvidenceData,
    questionType: QuestionType,
  ): EvidenceRankingResult {
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
    const semanticQuery = createSemanticQuery(this.questionText, questionType);
    const structuralSignalsAvailable =
      targetCommitIds.size > 0 ||
      targetPullRequestNumbers.size > 0 ||
      targetIssueNumbers.size > 0;

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
          semanticQuery,
          structuralSignalsAvailable,
          getEvidenceText(commit.message, commit.author),
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
          semanticQuery,
          structuralSignalsAvailable,
          getEvidenceText(pullRequest.title, pullRequest.author),
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
          semanticQuery,
          structuralSignalsAvailable,
          getEvidenceText(issue.title),
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
          semanticQuery,
          structuralSignalsAvailable,
          getEvidenceText(document.title, document.summary),
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
    semanticQuery: SemanticQuery,
    structuralSignalsAvailable: boolean,
    evidenceText: string,
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

    if (!structuralSignalsAvailable) {
      const semanticMatch = getSemanticMatch(semanticQuery, evidenceText);
      if (semanticMatch.score > 0) {
        score += semanticMatch.score;
        reasons.push(...semanticMatch.reasons);
      }
    }

    return { item, score: Math.min(score, 1), reasons };
  }
}

interface SemanticQuery {
  questionTerms: ReadonlySet<string>;
  questionTypeTerms: ReadonlySet<string>;
}

interface SemanticMatch {
  score: number;
  reasons: string[];
}

function createSemanticQuery(
  questionText: string,
  questionType: QuestionType,
): SemanticQuery {
  return {
    questionTerms: new Set(tokenize(questionText)),
    questionTypeTerms: new Set(QUESTION_TYPE_TERMS[questionType]),
  };
}

function getEvidenceText(...values: Array<string | undefined>): string {
  return values.filter((value): value is string => typeof value === "string").join(" ");
}

function getSemanticMatch(
  query: SemanticQuery,
  evidenceText: string,
): SemanticMatch {
  const evidenceTerms = new Set(tokenize(evidenceText));
  if (evidenceTerms.size === 0 || query.questionTerms.size === 0) {
    return { score: 0, reasons: [] };
  }

  const matchedQuestionTerms = intersection(query.questionTerms, evidenceTerms);
  if (matchedQuestionTerms.length === 0) {
    return { score: 0, reasons: [] };
  }

  const keywordOverlap = matchedQuestionTerms.length / query.questionTerms.size;
  const normalizedSimilarity =
    matchedQuestionTerms.length /
    Math.sqrt(query.questionTerms.size * evidenceTerms.size);
  const matchedIntentTerms = intersection(query.questionTypeTerms, evidenceTerms);
  const intentCoverage =
    query.questionTypeTerms.size === 0
      ? 0
      : matchedIntentTerms.length / query.questionTypeTerms.size;
  const score = Math.min(
    SEMANTIC_FALLBACK_MAX_SCORE,
    SEMANTIC_FALLBACK_MAX_SCORE *
      (0.65 * keywordOverlap + 0.25 * normalizedSimilarity + 0.1 * intentCoverage),
  );
  const reasons = [
    `Matches question keywords: ${matchedQuestionTerms.join(", ")}.`,
  ];

  if (matchedIntentTerms.length > 0) {
    reasons.push(
      `Matches ${formatQuestionType(query.questionTypeTerms)} intent terms: ${matchedIntentTerms.join(", ")}.`,
    );
  }

  return { score, reasons };
}

function formatQuestionType(terms: ReadonlySet<string>): string {
  for (const [questionType, questionTypeTerms] of Object.entries(QUESTION_TYPE_TERMS)) {
    if (questionTypeTerms.length === terms.size && questionTypeTerms.every((term) => terms.has(term))) {
      return questionType;
    }
  }

  return "question";
}

function tokenize(value: string): string[] {
  return [...new Set(
    value
      .toLowerCase()
      .match(/[a-z0-9]+/g)
      ?.map(normalizeToken)
      .filter((token) => token.length > 1 && !STOP_WORDS.has(token)) ?? [],
  )];
}

function normalizeToken(token: string): string {
  if (token.endsWith("ies") && token.length > 4) {
    return `${token.slice(0, -3)}y`;
  }
  if (token.endsWith("ed") && token.length > 4) {
    return token.slice(0, -2);
  }
  if (token.endsWith("s") && token.length > 3) {
    return token.slice(0, -1);
  }

  return token;
}

function intersection(
  left: ReadonlySet<string>,
  right: ReadonlySet<string>,
): string[] {
  return [...left].filter((value) => right.has(value)).sort();
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
