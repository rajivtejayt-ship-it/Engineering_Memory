import type { QuestionType } from "@/lib/constants";
import type { RepositoryContext } from "@/lib/types";
import { EvidenceDeduplicator } from "./deduplicator";
import { EvidenceRankingEngine } from "./ranking";

export {
  EvidenceRankingEngine,
  EVIDENCE_RANKING_WEIGHTS,
  type EvidenceRankingResult,
} from "./ranking";
export {
  EvidenceDeduplicator,
  deduplicateRetrievalResult,
  deduplicateRankedEvidence,
} from "./deduplicator";

/**
 * A normalized commit record supplied by a repository API adapter.
 * Adapters should map provider-specific payloads into this shape.
 */
export interface RepositoryCommit {
  /** Provider-stable or content-addressed commit identifier. */
  id: string;
  /** Commit subject or concise change description. */
  message: string;
  /** ISO 8601 author timestamp. */
  authoredAt: string;
  /** Display name or login of the commit author. */
  author: string;
  /** Repository-relative files changed by the commit. */
  files: string[];
  /** Parent commit identifiers, if the provider supplies them. */
  parentIds?: string[];
  /** Pull request containing this commit, when known. */
  pullRequestNumber?: number;
  /** Issues referenced by this commit, when known. */
  issueNumbers?: number[];
}

/** A normalized pull request record supplied by a repository API adapter. */
export interface RepositoryPullRequest {
  /** Provider pull request number. */
  number: number;
  /** Pull request title. */
  title: string;
  /** Display name or login of the pull request author. */
  author: string;
  /** Current pull request state. */
  status: "open" | "merged" | "closed";
  /** ISO 8601 merge timestamp, when merged. */
  mergedAt?: string;
  /** ISO 8601 creation timestamp. */
  createdAt?: string;
  /** Commit identifiers associated with the pull request. */
  commitIds: string[];
  /** Concise API-derived pull request description. */
  summary: string;
  /** Issues addressed by this pull request, when known. */
  issueNumbers?: number[];
  /** Files changed by the pull request, when supplied by the API. */
  files?: string[];
}

/** A normalized issue record supplied by a repository API adapter. */
export interface RepositoryIssue {
  /** Provider issue number. */
  number: number;
  /** Issue title. */
  title: string;
  /** Current issue state. */
  status: "open" | "closed";
  /** ISO 8601 creation timestamp. */
  createdAt?: string;
  /** Labels assigned to the issue. */
  labels: string[];
  /** Concise API-derived issue description. */
  summary: string;
  /** Number of repository discussion or comment records available for the issue. */
  discussionCount?: number;
  /** Pull request that resolves the issue, when known. */
  pullRequestNumber?: number;
  /** Related commit identifiers, when known. */
  relatedCommitIds?: string[];
}

/** A normalized documentation record supplied by a repository API adapter. */
export interface RepositoryDocumentation {
  /** Repository-relative document path. */
  path: string;
  /** Human-readable document title. */
  title: string;
  /** ISO 8601 last-updated timestamp, when known. */
  updatedAt?: string;
  /** Concise extracted document content or summary. */
  summary: string;
}

/**
 * Repository evidence supplied by an API adapter. Every collection is
 * optional so partially available provider responses remain usable.
 */
export interface RepositoryEvidenceData {
  /** Commits available for the requested repository context. */
  commits?: RepositoryCommit[];
  /** Pull requests available for the requested repository context. */
  pullRequests?: RepositoryPullRequest[];
  /** Issues available for the requested repository context. */
  issues?: RepositoryIssue[];
  /** Documentation available for the requested repository context. */
  documentation?: RepositoryDocumentation[];
}

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
  commits: RankedEvidence<RepositoryCommit>[];
  /** Relevant pull requests, highest-ranked first. */
  pullRequests: RankedEvidence<RepositoryPullRequest>[];
  /** Relevant issues, highest-ranked first. */
  issues: RankedEvidence<RepositoryIssue>[];
  /** Relevant documentation, highest-ranked first. */
  documentation: RankedEvidence<RepositoryDocumentation>[];
}

/** Supplies repository data without coupling retrieval to a specific provider. */
export interface RepositoryDataSource {
  /** Returns API-normalized data for the requested repository context, if available. */
  getRepositoryData(
    repositoryContext: RepositoryContext,
  ): Promise<RepositoryEvidenceData | undefined>;
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

/** Sorts evidence by score and limits it to the configured result count. */
function selectRelevant<T>(
  rankedItems: RankedEvidence<T>[],
  maxResultsPerType: number,
): RankedEvidence<T>[] {
  const rankedMatches = rankedItems
    .filter((item) => item.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        getEvidenceSortKey(left.item).localeCompare(getEvidenceSortKey(right.item)),
    )
    .slice(0, maxResultsPerType);

  if (rankedMatches.length > 0) {
    return rankedMatches;
  }

  // File-level data is not always available from a provider. Preserve the
  // deterministic fallback evidence rather than generating a blank prompt.
  return [...rankedItems]
    .sort(
      (left, right) =>
        right.score - left.score ||
        getEvidenceSortKey(left.item).localeCompare(getEvidenceSortKey(right.item)),
    )
    .slice(0, maxResultsPerType);
}

/** Produces a stable tie-breaker for ranked repository records. */
function getEvidenceSortKey(item: unknown): string {
  if (typeof item !== "object" || item === null) {
    return "";
  }

  const record = item as Record<string, unknown>;
  for (const key of ["id", "number", "path"]) {
    const value = record[key];
    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }
  }

  return "";
}

/**
 * Retrieves and ranks evidence from supplied repository data. This pure
 * function is useful for tests and does not access GitHub or Gemini.
 */
export function retrieveEvidence(
  repositoryContext: RepositoryContext,
  questionType: QuestionType,
  repositoryData: RepositoryEvidenceData = {},
  options: RetrievalOptions = {},
): RetrievalResult {
  return retrieveEvidenceInternal(
    repositoryContext,
    questionType,
    repositoryData,
    options,
  );
}

/** Internal question-aware path used by the production agent wiring. */
function retrieveEvidenceInternal(
  repositoryContext: RepositoryContext,
  questionType: QuestionType,
  repositoryData: RepositoryEvidenceData,
  options: RetrievalOptions,
  questionText = "",
): RetrievalResult {
  const maxResultsPerType =
    options.maxResultsPerType ?? DEFAULT_MAX_RESULTS_PER_TYPE;
  const rankedEvidence = new EvidenceRankingEngine(questionText).rank(
    repositoryContext,
    repositoryData,
    questionType,
  );
  const deduplicatedEvidence = new EvidenceDeduplicator().deduplicate({
    repositoryContext,
    questionType,
    ...rankedEvidence,
  });
  const commits = selectRelevant(
    deduplicatedEvidence.commits,
    maxResultsPerType,
  );
  const pullRequests = selectRelevant(
    deduplicatedEvidence.pullRequests,
    maxResultsPerType,
  );
  const issues = selectRelevant(deduplicatedEvidence.issues, maxResultsPerType);
  const documentation = selectRelevant(
    deduplicatedEvidence.documentation,
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
  const retriever: QuestionAwareEvidenceRetriever = {
    async retrieveEvidence(repositoryContext, questionType) {
      const repositoryData = await repositoryDataSource.getRepositoryData(
        repositoryContext,
      );

      return retrieveEvidenceInternal(
        repositoryContext,
        questionType,
        repositoryData ?? {},
        options,
      );
    },
    async retrieveEvidenceForQuestion(repositoryContext, questionType, questionText) {
      const repositoryData = await repositoryDataSource.getRepositoryData(
        repositoryContext,
      );

      return retrieveEvidenceInternal(
        repositoryContext,
        questionType,
        repositoryData ?? {},
        options,
        questionText,
      );
    },
  };

  return retriever;
}

/**
 * Internal runtime capability. The public EvidenceRetriever contract remains
 * unchanged so injected retrievers that only implement that contract continue
 * to work.
 */
interface QuestionAwareEvidenceRetriever extends EvidenceRetriever {
  retrieveEvidenceForQuestion(
    repositoryContext: RepositoryContext,
    questionType: QuestionType,
    questionText: string,
  ): Promise<RetrievalResult>;
}
