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
}

/** A pull request available in mock repository data. */
export interface MockPullRequest {
  /** Pull request number. */
  number: number;
  /** Pull request title. */
  title: string;
  /** Current pull request state. */
  status: "open" | "merged" | "closed";
  /** ISO 8601 merge timestamp, when the pull request was merged. */
  mergedAt?: string;
  /** Identifiers of commits included in the pull request. */
  commitIds: string[];
  /** Concise description of the change. */
  summary: string;
}

/** An issue available in mock repository data. */
export interface MockIssue {
  /** Issue number. */
  number: number;
  /** Issue title. */
  title: string;
  /** Current issue state. */
  status: "open" | "closed";
  /** Labels used to categorize the issue. */
  labels: string[];
  /** Concise description of the reported problem or request. */
  summary: string;
}

/** A documentation artifact available in mock repository data. */
export interface MockDocumentation {
  /** Repository-relative path to the document. */
  path: string;
  /** Human-readable document title. */
  title: string;
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
  /** Pull requests included for test scenarios. */
  pullRequests?: MockPullRequest[];
  /** Issues included for test scenarios. */
  issues?: MockIssue[];
  /** Documentation artifacts included for test scenarios. */
  documentation?: MockDocumentation[];
  /** Cross-cutting project events included for test scenarios. */
  timeline?: TimelineEvent[];
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
