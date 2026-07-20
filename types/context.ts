import type {
  CommitSummary,
  DiscussionSummary,
  FileChange,
  IssueSummary,
  PullRequestSummary,
} from "./github";
import type { RepositoryMetadata } from "./repository";

/** A file related to the repository question or historical evidence. */
export interface RelatedFile {
  readonly change: FileChange;
  readonly relevance: string;
}

/** A code area that should be handled carefully when modified. */
export interface RiskArea {
  readonly path: string;
  readonly reason: string;
  readonly relatedPullRequestNumbers: readonly number[];
  readonly relatedIssueNumbers: readonly number[];
}

/** A chronological event assembled from GitHub history. */
export interface TimelineEvent {
  readonly occurredAt: string;
  readonly type: "COMMIT" | "PULL_REQUEST" | "ISSUE" | "DISCUSSION";
  readonly title: string;
  readonly url: string;
}

/** Complete backend-produced input for repository analysis. */
export interface RepositoryContext {
  readonly repository: RepositoryMetadata;
  readonly commits: readonly CommitSummary[];
  readonly pullRequests: readonly PullRequestSummary[];
  readonly issues: readonly IssueSummary[];
  readonly discussions: readonly DiscussionSummary[];
  readonly relatedFiles: readonly RelatedFile[];
  readonly riskAreas: readonly RiskArea[];
  readonly timeline: readonly TimelineEvent[];
}
