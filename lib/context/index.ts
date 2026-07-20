import type { QuestionType } from "@/lib/constants";
import type { RankedEvidence, RetrievalResult } from "@/lib/retriever";
import type { RepositoryContext, TimelineEvent } from "@/lib/types";

/** A commit available in mock repository data. */
export interface MockCommit {
  /** Short or full commit identifier. */
  id: string;
  /** Commit subject line. */
  message: string;
  /** ISO 8601 timestamp for when the commit was authored. */
  authoredAt: string;
  /** Display name of the commit author. */
  author: string;
  /** Files changed by the commit. */
  files: string[];
  /** Parent commit identifiers in the simulated commit graph. */
  parentIds?: string[];
  /** Pull request that contains this commit, when applicable. */
  pullRequestNumber?: number;
  /** Issues addressed or referenced by this commit. */
  issueNumbers?: number[];
}

/** A contributor active in mock repository data. */
export interface MockContributor {
  /** Stable contributor identifier. */
  id: string;
  /** Human-readable contributor name. */
  name: string;
  /** Primary engineering responsibility. */
  role: string;
}

/** A pull request available in mock repository data. */
export interface MockPullRequest {
  /** Pull request number. */
  number: number;
  /** Pull request title. */
  title: string;
  /** Contributor who opened the pull request. */
  author: string;
  /** Current pull request state. */
  status: "open" | "merged" | "closed";
  /** ISO 8601 merge timestamp, when the pull request was merged. */
  mergedAt?: string;
  /** ISO 8601 timestamp for when the pull request was opened. */
  createdAt?: string;
  /** Identifiers of commits included in the pull request. */
  commitIds: string[];
  /** Concise description of the change. */
  summary: string;
  /** Issues addressed by this pull request. */
  issueNumbers?: number[];
}

/** An issue available in mock repository data. */
export interface MockIssue {
  /** Issue number. */
  number: number;
  /** Issue title. */
  title: string;
  /** Current issue state. */
  status: "open" | "closed";
  /** ISO 8601 timestamp for when the issue was created. */
  createdAt?: string;
  /** Labels used to categorize the issue. */
  labels: string[];
  /** Concise description of the reported problem or request. */
  summary: string;
  /** Pull request that addresses this issue, when available. */
  pullRequestNumber?: number;
  /** Commits related to this issue. */
  relatedCommitIds?: string[];
}

/** A repository file and the commits that changed it. */
export interface MockFileHistory {
  /** Repository-relative file path. */
  path: string;
  /** Commits that changed this file, in chronological order. */
  commitIds: string[];
  /** ISO 8601 timestamp of the first tracked change. */
  firstChangedAt: string;
  /** ISO 8601 timestamp of the most recent tracked change. */
  lastChangedAt: string;
  /** Contributors who changed this file. */
  contributors: string[];
}

/** A documentation artifact available in mock repository data. */
export interface MockDocumentation {
  /** Repository-relative path to the document. */
  path: string;
  /** Human-readable document title. */
  title: string;
  /** ISO 8601 timestamp for when the document was last updated. */
  updatedAt?: string;
  /** Concise description of the document contents. */
  summary: string;
}

/**
 * Repository data supplied by a mock source while GitHub integration is not
 * implemented.
 */
export interface MockRepositoryData {
  /** Repository name or canonical repository identifier. */
  repository: string;
  /** Optional branch, tag, or commit represented by this mock data. */
  ref?: string;
  /** Optional file path included in the mock repository context. */
  filePath?: string;
  /** Commit history included for test scenarios. */
  commits?: MockCommit[];
  /** Contributors included for test scenarios. */
  contributors?: MockContributor[];
  /** Pull requests included for test scenarios. */
  pullRequests?: MockPullRequest[];
  /** Issues included for test scenarios. */
  issues?: MockIssue[];
  /** Documentation artifacts included for test scenarios. */
  documentation?: MockDocumentation[];
  /** Per-file history derived from the commit graph. */
  fileHistories?: MockFileHistory[];
  /** Cross-cutting project events included for test scenarios. */
  timeline?: TimelineEvent[];
}

/** Source category for evidence included in an LLM context package. */
export type ContextEvidenceSource =
  | "commit"
  | "pull-request"
  | "issue"
  | "documentation";

/** A compact evidence item suitable for an LLM prompt. */
export interface ContextEvidence {
  /** Stable identifier, namespaced by evidence source. */
  id: string;
  /** Repository source from which the evidence was selected. */
  source: ContextEvidenceSource;
  /** Short evidence title. */
  title: string;
  /** Compact evidence description. */
  summary: string;
  /** Event timestamp, when the source supplies one. */
  occurredAt?: string;
  /** Retriever-assigned relevance score. */
  relevanceScore: number;
  /** Retriever signals that explain why the item was selected. */
  relevanceReasons: string[];
}

/** Bounded, chronological evidence prepared for prompt construction. */
export interface ContextPackage {
  /** Repository context shared by all selected evidence. */
  repositoryContext: RepositoryContext;
  /** Classified question type used during retrieval. */
  questionType: QuestionType;
  /** De-duplicated evidence ordered from oldest to newest. */
  evidence: ContextEvidence[];
  /** Number of unique evidence items before package limits were applied. */
  totalEvidenceCount: number;
  /** Approximate character count of evidence included in the package. */
  characterCount: number;
  /** Whether one or more evidence items were omitted to meet package limits. */
  truncated: boolean;
}

/** Options that keep a context package within an LLM prompt budget. */
export interface ContextBuilderOptions {
  /** Maximum number of evidence items included in the package. */
  maxEvidenceItems?: number;
  /** Maximum approximate character count for included evidence. */
  maxCharacters?: number;
}

const DEFAULT_MAX_EVIDENCE_ITEMS = 12;
const DEFAULT_MAX_CONTEXT_CHARACTERS = 6_000;

/** Converts retriever output into a compact, source-neutral evidence item. */
function createContextEvidence<T>(
  evidence: RankedEvidence<T>,
  source: ContextEvidenceSource,
  id: string,
  title: string,
  summary: string,
  occurredAt?: string,
): ContextEvidence {
  return {
    id: `${source}:${id}`,
    source,
    title,
    summary,
    occurredAt,
    relevanceScore: evidence.score,
    relevanceReasons: evidence.reasons,
  };
}

/** Removes items with the same source-scoped evidence identifier. */
export function removeDuplicateEvidence(
  evidence: ContextEvidence[],
): ContextEvidence[] {
  const seenEvidenceIds = new Set<string>();

  return evidence.filter((item) => {
    if (seenEvidenceIds.has(item.id)) {
      return false;
    }

    seenEvidenceIds.add(item.id);
    return true;
  });
}

/** Orders dated evidence from oldest to newest and keeps undated items last. */
export function orderEvidenceChronologically(
  evidence: ContextEvidence[],
): ContextEvidence[] {
  return [...evidence].sort((left, right) => {
    const leftDate = left.occurredAt ?? "9999-12-31T23:59:59Z";
    const rightDate = right.occurredAt ?? "9999-12-31T23:59:59Z";

    return (
      leftDate.localeCompare(rightDate) ||
      right.relevanceScore - left.relevanceScore ||
      left.id.localeCompare(right.id)
    );
  });
}

/** Returns the approximate character count of an evidence item in a prompt. */
function getEvidenceCharacterCount(evidence: ContextEvidence): number {
  return [
    evidence.source,
    evidence.title,
    evidence.summary,
    evidence.occurredAt ?? "",
    evidence.relevanceReasons.join(" "),
  ].join("\n").length;
}

/** Applies item-count and character limits while retaining chronological order. */
export function limitContextEvidence(
  evidence: ContextEvidence[],
  options: ContextBuilderOptions = {},
): { evidence: ContextEvidence[]; characterCount: number; truncated: boolean } {
  const maxEvidenceItems = Math.max(
    0,
    options.maxEvidenceItems ?? DEFAULT_MAX_EVIDENCE_ITEMS,
  );
  const maxCharacters = Math.max(
    0,
    options.maxCharacters ?? DEFAULT_MAX_CONTEXT_CHARACTERS,
  );
  const limitedEvidence: ContextEvidence[] = [];
  let characterCount = 0;
  let truncated = false;

  for (const item of evidence) {
    const itemCharacterCount = getEvidenceCharacterCount(item);

    if (
      limitedEvidence.length === maxEvidenceItems ||
      characterCount + itemCharacterCount > maxCharacters
    ) {
      truncated = true;
      continue;
    }

    limitedEvidence.push(item);
    characterCount += itemCharacterCount;
  }

  return { evidence: limitedEvidence, characterCount, truncated };
}

/**
 * Builds a bounded context package from retrieved evidence. It only reshapes
 * supplied retrieval output and does not access repository providers.
 */
export function buildContextPackage(
  retrievalResult: RetrievalResult,
  options: ContextBuilderOptions = {},
): ContextPackage {
  const evidence = [
    ...retrievalResult.commits.map((item) =>
      createContextEvidence(
        item,
        "commit",
        item.item.id,
        item.item.message,
        `Authored by ${item.item.author}; files: ${item.item.files.join(", ")}.`,
        item.item.authoredAt,
      ),
    ),
    ...retrievalResult.pullRequests.map((item) =>
      createContextEvidence(
        item,
        "pull-request",
        String(item.item.number),
        item.item.title,
        item.item.summary,
        item.item.mergedAt,
      ),
    ),
    ...retrievalResult.issues.map((item) =>
      createContextEvidence(
        item,
        "issue",
        String(item.item.number),
        item.item.title,
        item.item.summary,
        item.item.createdAt,
      ),
    ),
    ...retrievalResult.documentation.map((item) =>
      createContextEvidence(
        item,
        "documentation",
        item.item.path,
        item.item.title,
        item.item.summary,
        item.item.updatedAt,
      ),
    ),
  ];
  const uniqueEvidence = removeDuplicateEvidence(evidence);
  const orderedEvidence = orderEvidenceChronologically(uniqueEvidence);
  const limitedEvidence = limitContextEvidence(orderedEvidence, options);

  return {
    repositoryContext: retrievalResult.repositoryContext,
    questionType: retrievalResult.questionType,
    evidence: limitedEvidence.evidence,
    totalEvidenceCount: uniqueEvidence.length,
    characterCount: limitedEvidence.characterCount,
    truncated: limitedEvidence.truncated,
  };
}

/**
 * Converts mock repository data into the shared repository-context shape.
 * This function is intentionally pure and independent of external APIs.
 */
export function buildRepositoryContext(
  mockData: MockRepositoryData,
): RepositoryContext {
  return {
    repository: mockData.repository,
    ref: mockData.ref,
    filePath: mockData.filePath,
  };
}

export {
  mockEngineeringRepositoryData,
  mockRepositoryData,
} from "./mock-data";
