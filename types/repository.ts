/** Public identity and profile information for a repository owner. */
export interface RepositoryOwner {
  readonly login: string;
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
  readonly profileUrl: string;
}

/** Repository-level counts supplied by GitHub. */
export interface RepositoryStatistics {
  readonly stars: number;
  readonly forks: number;
  readonly openIssues: number;
  readonly watchers: number;
}

/** A language detected in a repository. */
export interface RepositoryLanguage {
  readonly name: string;
  readonly bytes: number;
  readonly percentage: number;
}

/** A branch available in a repository. */
export interface RepositoryBranch {
  readonly name: string;
  readonly isDefault: boolean;
  readonly isProtected: boolean;
}

/** Public metadata used to identify and describe a repository. */
export interface RepositoryMetadata {
  readonly owner: RepositoryOwner;
  readonly name: string;
  readonly fullName: string;
  readonly url: string;
  readonly description: string | null;
  readonly defaultBranch: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly statistics: RepositoryStatistics;
  readonly languages: readonly RepositoryLanguage[];
  readonly branches: readonly RepositoryBranch[];
}
