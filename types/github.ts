/** The GitHub user associated with a historical record. */
export interface Author {
  readonly login: string;
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
  readonly profileUrl: string;
}

/** A file and optional line range relevant to an analysis result. */
export interface CodeLocation {
  readonly path: string;
  readonly startLine: number | null;
  readonly endLine: number | null;
  readonly ref: string | null;
}

/** The change to one file in a commit or pull request. */
export interface FileChange {
  readonly path: string;
  readonly previousPath: string | null;
  readonly status: "ADDED" | "MODIFIED" | "DELETED" | "RENAMED";
  readonly additions: number;
  readonly deletions: number;
}

/** A compact commit record fetched from GitHub. */
export interface CommitSummary {
  readonly sha: string;
  readonly message: string;
  readonly author: Author | null;
  readonly authoredAt: string;
  readonly url: string;
  readonly files: readonly FileChange[];
}

/** A compact pull request record fetched from GitHub. */
export interface PullRequestSummary {
  readonly number: number;
  readonly title: string;
  readonly body: string | null;
  readonly state: "OPEN" | "CLOSED" | "MERGED";
  readonly author: Author | null;
  readonly createdAt: string;
  readonly closedAt: string | null;
  readonly mergedAt: string | null;
  readonly url: string;
  readonly files: readonly FileChange[];
}

/** A compact issue record fetched from GitHub. */
export interface IssueSummary {
  readonly number: number;
  readonly title: string;
  readonly body: string | null;
  readonly state: "OPEN" | "CLOSED";
  readonly author: Author | null;
  readonly createdAt: string;
  readonly closedAt: string | null;
  readonly url: string;
}

/** A compact repository discussion record fetched from GitHub. */
export interface DiscussionSummary {
  readonly number: number;
  readonly title: string;
  readonly body: string | null;
  readonly category: string;
  readonly author: Author | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly url: string;
}
