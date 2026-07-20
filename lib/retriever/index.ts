import type { QuestionType } from "@/lib/constants";
import type {
  MockCommit,
  MockDocumentation,
  MockIssue,
  MockPullRequest,
  MockRepositoryData,
} from "@/lib/context";
import type { RepositoryContext } from "@/lib/types";

/** A retrieved item with its deterministic relevance score. */
export interface RankedEvidence<T> {
  /** The repository item selected as evidence. */
  item: T;
  /** Relevance score on a 0–1 scale. */
  score: number;
  /** Reasons that contributed to the relevance score. */
  reasons: string[];
}

/** Structured evidence returned for a classified repository question. */
export interface RetrievalResult {
  /** Context used to retrieve and rank the evidence. */
  repositoryContext: RepositoryContext;
  /** Classification that guided evidence selection. */
  questionType: QuestionType;
  /** Relevant commits, highest-ranked first. */
  commits: RankedEvidence<MockCommit>[];
  /** Relevant pull requests, highest-ranked first. */
  pullRequests: RankedEvidence<MockPullRequest>[];
  /** Relevant issues, highest-ranked first. */
  issues: RankedEvidence<MockIssue>[];
  /** Relevant documentation, highest-ranked first. */
  documentation: RankedEvidence<MockDocumentation>[];
}

/** Supplies repository data without coupling retrieval to a specific provider. */
export interface RepositoryDataSource {
  /** Returns data for the requested repository context, if it is available. */
  getRepositoryData(
    repositoryContext: RepositoryContext,
  ): Promise<MockRepositoryData | undefined>;
}

/** Configures the evidence-selection behavior. */
export interface RetrievalOptions {
  /** Maximum number of items selected from each evidence type. */
  maxResultsPerType?: number;
}

/** Public retriever contract for use by the agent or an API route. */
export interface EvidenceRetriever {
  /** Retrieves ranked evidence for a repository context and question type. */
  retrieveEvidence(
    repositoryContext: RepositoryContext,
    questionType: QuestionType,
  ): Promise<RetrievalResult>;
}

const DEFAULT_MAX_RESULTS_PER_TYPE = 3;

const QUESTION_KEYWORDS: Record<QuestionType, string[]> = {
  WHY_INTRODUCED: ["add", "introduce", "initial", "feature", "decision"],
  WHY_CHANGED: ["change", "update", "upgrade", "migrate", "standardize"],
  BREAKAGE: ["bug", "error", "failure", "fix", "regression", "timeout"],
  RELEVANCE: ["architecture", "flow", "impact", "dependency", "overview"],
  UNKNOWN: [],
};

/** Normalizes text before simple keyword comparisons. */
function normalize(value: string): string {
  return value.toLowerCase();
}

/** Ranks one item using its searchable text and optional changed file paths. */
function rankItem<T>(
  item: T,
  searchableText: string,
  filePaths: string[],
  repositoryContext: RepositoryContext,
  questionType: QuestionType,
): RankedEvidence<T> {
  const reasons: string[] = [];
  const normalizedText = normalize(searchableText);
  let score = 0;

  const matchingKeywords = QUESTION_KEYWORDS[questionType].filter((keyword) =>
    normalizedText.includes(keyword),
  );

  if (matchingKeywords.length > 0) {
    score += Math.min(0.5, matchingKeywords.length * 0.2);
    reasons.push(
      `Matches ${matchingKeywords.join(", ")} keywords for ${questionType}.`,
    );
  }

  if (
    repositoryContext.filePath &&
    filePaths.some((filePath) => filePath === repositoryContext.filePath)
  ) {
    score += 0.5;
    reasons.push(`References ${repositoryContext.filePath}.`);
  }

  if (score === 0 && questionType === "UNKNOWN") {
    score = 0.1;
    reasons.push("Included because the question type is unknown.");
  }

  return {
    item,
    score: Math.min(score, 1),
    reasons,
  };
}

/** Sorts evidence by score and limits it to the configured result count. */
function selectRelevant<T>(
  rankedItems: RankedEvidence<T>[],
  maxResultsPerType: number,
): RankedEvidence<T>[] {
  return rankedItems
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, maxResultsPerType);
}

/**
 * Retrieves and ranks evidence from supplied repository data. This pure
 * function is useful for tests and does not access GitHub or Gemini.
 */
export function retrieveEvidence(
  repositoryContext: RepositoryContext,
  questionType: QuestionType,
  repositoryData: MockRepositoryData,
  options: RetrievalOptions = {},
): RetrievalResult {
  const maxResultsPerType =
    options.maxResultsPerType ?? DEFAULT_MAX_RESULTS_PER_TYPE;

  const commits = selectRelevant(
    (repositoryData.commits ?? []).map((commit) =>
      rankItem(
        commit,
        `${commit.message} ${commit.author}`,
        commit.files,
        repositoryContext,
        questionType,
      ),
    ),
    maxResultsPerType,
  );

  const pullRequests = selectRelevant(
    (repositoryData.pullRequests ?? []).map((pullRequest) =>
      rankItem(
        pullRequest,
        `${pullRequest.title} ${pullRequest.summary}`,
        [],
        repositoryContext,
        questionType,
      ),
    ),
    maxResultsPerType,
  );

  const issues = selectRelevant(
    (repositoryData.issues ?? []).map((issue) =>
      rankItem(
        issue,
        `${issue.title} ${issue.summary} ${issue.labels.join(" ")}`,
        [],
        repositoryContext,
        questionType,
      ),
    ),
    maxResultsPerType,
  );

  const documentation = selectRelevant(
    (repositoryData.documentation ?? []).map((document) =>
      rankItem(
        document,
        `${document.title} ${document.summary}`,
        [document.path],
        repositoryContext,
        questionType,
      ),
    ),
    maxResultsPerType,
  );

  return {
    repositoryContext,
    questionType,
    commits,
    pullRequests,
    issues,
    documentation,
  };
}

/** Creates a retriever backed by an injected repository-data source. */
export function createEvidenceRetriever(
  repositoryDataSource: RepositoryDataSource,
  options: RetrievalOptions = {},
): EvidenceRetriever {
  return {
    async retrieveEvidence(repositoryContext, questionType) {
      const repositoryData = await repositoryDataSource.getRepositoryData(
        repositoryContext,
      );

      return retrieveEvidence(
        repositoryContext,
        questionType,
        repositoryData ?? { repository: repositoryContext.repository },
        options,
      );
    },
  };
}
