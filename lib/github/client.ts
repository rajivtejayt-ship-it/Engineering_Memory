const GITHUB_HOST = "github.com";
const GITHUB_API_URL = "https://api.github.com";

export interface GitHubRepositoryReference {
  owner: string;
  name: string;
}

export interface GitHubRepository {
  owner: string;
  ownerProfile: {
    login: string;
    displayName: string | null;
    avatarUrl: string | null;
    profileUrl: string;
  };
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  statistics: {
    stars: number;
    forks: number;
    openIssues: number;
    watchers: number;
  };
  languages: Array<{
    name: string;
    bytes: number;
    percentage: number;
  }>;
  branches: Array<{
    name: string;
    isDefault: boolean;
    isProtected: boolean;
  }>;
}

/** A lightweight commit record returned by the GitHub commits endpoint. */
export interface GitHubCommit {
  sha: string;
  message: string;
  author: {
    login: string;
    displayName: string | null;
    avatarUrl: string | null;
    profileUrl: string;
  } | null;
  authoredAt: string;
  url: string;
}

/** A lightweight pull request record returned by the GitHub pulls endpoint. */
export interface GitHubPullRequest {
  number: number;
  title: string;
  state: "OPEN" | "CLOSED" | "MERGED";
  author: {
    login: string;
    displayName: string | null;
    avatarUrl: string | null;
    profileUrl: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  mergedAt: string | null;
  url: string;
}

/** A lightweight issue record returned by the GitHub issues endpoint. */
export interface GitHubIssue {
  number: number;
  title: string;
  state: "OPEN" | "CLOSED";
  author: {
    login: string;
    displayName: string | null;
    avatarUrl: string | null;
    profileUrl: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  labels: string[];
  url: string;
}

/** Validates a public GitHub repository URL and extracts its owner and name. */
export function parseGitHubRepositoryUrl(
  repositoryUrl: string,
): GitHubRepositoryReference {
  let url: URL;

  try {
    url = new URL(repositoryUrl);
  } catch {
    throw new Error("Repository URL must be a valid GitHub URL.");
  }

  if (url.protocol !== "https:" || url.hostname !== GITHUB_HOST) {
    throw new Error("Repository URL must use https://github.com.");
  }

  const pathSegments = url.pathname.split("/").filter(Boolean);
  if (pathSegments.length < 2) {
    throw new Error("Repository URL must include an owner and repository name.");
  }

  const [owner, repositoryName] = pathSegments;
  const name = repositoryName.replace(/\.git$/, "");

  if (!owner || !name) {
    throw new Error("Repository URL must include an owner and repository name.");
  }

  return { owner, name };
}

/** Fetches public repository metadata required by import and context building. */
export async function getRepository(
  reference: GitHubRepositoryReference,
  accessToken?: string,
): Promise<GitHubRepository> {
  const repositoryUrl = `${GITHUB_API_URL}/repos/${encodeURIComponent(reference.owner)}/${encodeURIComponent(reference.name)}`;
  const response = await fetchGitHub(repositoryUrl, accessToken);

  if (response.status === 404) {
    throw new Error("GitHub repository was not found.");
  }

  if (response.status === 403 || response.status === 429) {
    throw new Error("GitHub API rate limit reached. Connect GitHub for a higher limit or try again later.");
  }

  if (!response.ok) {
    throw new Error("GitHub repository metadata could not be fetched.");
  }

  const data: unknown = await response.json();
  if (!isGitHubRepositoryResponse(data)) {
    throw new Error("GitHub returned incomplete repository metadata.");
  }

  const [languagesResponse, branchesResponse] = await Promise.all([
    fetchGitHub(`${repositoryUrl}/languages`, accessToken),
    fetchGitHub(`${repositoryUrl}/branches?per_page=100`, accessToken),
  ]);

  if (languagesResponse.status === 403 || languagesResponse.status === 429 || branchesResponse.status === 403 || branchesResponse.status === 429) {
    throw new Error("GitHub API rate limit reached. Connect GitHub for a higher limit or try again later.");
  }

  if (!languagesResponse.ok || !branchesResponse.ok) {
    throw new Error("GitHub repository metadata could not be fetched.");
  }

  const languages: unknown = await languagesResponse.json();
  const branches: unknown = await branchesResponse.json();

  if (!isGitHubLanguagesResponse(languages) || !isGitHubBranchesResponse(branches)) {
    throw new Error("GitHub returned incomplete repository metadata.");
  }

  const totalLanguageBytes = Object.values(languages).reduce(
    (total, bytes) => total + bytes,
    0,
  );

  return {
    owner: data.owner.login,
    ownerProfile: {
      login: data.owner.login,
      displayName: null,
      avatarUrl: data.owner.avatar_url,
      profileUrl: data.owner.html_url,
    },
    name: data.name,
    fullName: data.full_name,
    url: data.html_url,
    description: data.description,
    defaultBranch: data.default_branch,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    statistics: {
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      watchers: data.subscribers_count,
    },
    languages: Object.entries(languages).map(([name, bytes]) => ({
      name,
      bytes,
      percentage: totalLanguageBytes === 0 ? 0 : (bytes / totalLanguageBytes) * 100,
    })),
    branches: branches.map((branch) => ({
      name: branch.name,
      isDefault: branch.name === data.default_branch,
      isProtected: branch.protected,
    })),
  };
}

/** Fetches the most recent lightweight commit records for a public repository. */
export async function getCommits(
  reference: GitHubRepositoryReference,
): Promise<GitHubCommit[]> {
  const commitsUrl = `${GITHUB_API_URL}/repos/${encodeURIComponent(reference.owner)}/${encodeURIComponent(reference.name)}/commits?per_page=20`;
  const response = await fetchGitHub(commitsUrl);

  if (response.status === 404) {
    throw new Error("GitHub repository was not found.");
  }

  if (!response.ok) {
    throw new Error("GitHub commits could not be fetched.");
  }

  const data: unknown = await response.json();
  if (!isGitHubCommitsResponse(data)) {
    throw new Error("GitHub returned incomplete commit metadata.");
  }

  return data.map((commit) => ({
    sha: commit.sha,
    message: commit.commit.message,
    author:
      commit.author === null
        ? null
        : {
            login: commit.author.login,
            displayName: null,
            avatarUrl: commit.author.avatar_url,
            profileUrl: commit.author.html_url,
          },
    authoredAt: commit.commit.author.date,
    url: commit.html_url,
  }));
}

/** Fetches the most recently updated lightweight pull requests for a repository. */
export async function getPullRequests(
  reference: GitHubRepositoryReference,
): Promise<GitHubPullRequest[]> {
  const pullRequestsUrl = `${GITHUB_API_URL}/repos/${encodeURIComponent(reference.owner)}/${encodeURIComponent(reference.name)}/pulls?state=all&sort=updated&direction=desc&per_page=20`;
  const response = await fetchGitHub(pullRequestsUrl);

  if (response.status === 404) {
    throw new Error("GitHub repository was not found.");
  }

  if (!response.ok) {
    throw new Error("GitHub pull requests could not be fetched.");
  }

  const data: unknown = await response.json();
  if (!isGitHubPullRequestsResponse(data)) {
    throw new Error("GitHub returned incomplete pull request metadata.");
  }

  return data.map((pullRequest) => ({
    number: pullRequest.number,
    title: pullRequest.title,
    state:
      pullRequest.merged_at !== null
        ? "MERGED"
        : pullRequest.state === "open"
          ? "OPEN"
          : "CLOSED",
    author:
      pullRequest.user === null
        ? null
        : {
            login: pullRequest.user.login,
            displayName: null,
            avatarUrl: pullRequest.user.avatar_url,
            profileUrl: pullRequest.user.html_url,
          },
    createdAt: pullRequest.created_at,
    updatedAt: pullRequest.updated_at,
    closedAt: pullRequest.closed_at,
    mergedAt: pullRequest.merged_at,
    url: pullRequest.html_url,
  }));
}

/** Fetches the most recently updated lightweight issues for a repository. */
export async function getIssues(
  reference: GitHubRepositoryReference,
): Promise<GitHubIssue[]> {
  const issuesUrl = `${GITHUB_API_URL}/repos/${encodeURIComponent(reference.owner)}/${encodeURIComponent(reference.name)}/issues?state=all&sort=updated&direction=desc&per_page=20`;
  const response = await fetchGitHub(issuesUrl);

  if (response.status === 404) {
    throw new Error("GitHub repository was not found.");
  }

  if (!response.ok) {
    throw new Error("GitHub issues could not be fetched.");
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return [];
  }

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .filter(isGitHubIssueResponse)
    .filter((issue) => !("pull_request" in issue))
    .map((issue) => ({
      number: issue.number,
      title: issue.title,
      state: issue.state === "open" ? "OPEN" : "CLOSED",
      author: toGitHubAuthor(issue.user),
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      closedAt: issue.closed_at,
      labels: toGitHubIssueLabels(issue.labels),
      url: issue.html_url,
    }));
}

/** Discussion collection is intentionally deferred until a GitHub discussion source is configured. */
export async function getDiscussions(): Promise<void> {}

function fetchGitHub(url: string, accessToken?: string): Promise<Response> {
  return fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "engineering-memory",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
}

function isGitHubRepositoryResponse(
  value: unknown,
): value is {
  owner: {
    login: string;
    avatar_url: string | null;
    html_url: string;
  };
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  default_branch: string;
  created_at: string;
  updated_at: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  subscribers_count: number;
} {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const repository = value as Record<string, unknown>;
  const owner = repository.owner;

  return (
    typeof repository.name === "string" &&
    typeof repository.full_name === "string" &&
    typeof repository.html_url === "string" &&
    isNullableString(repository.description) &&
    typeof repository.default_branch === "string" &&
    typeof repository.created_at === "string" &&
    typeof repository.updated_at === "string" &&
    typeof repository.stargazers_count === "number" &&
    typeof repository.forks_count === "number" &&
    typeof repository.open_issues_count === "number" &&
    typeof repository.subscribers_count === "number" &&
    typeof owner === "object" &&
    owner !== null &&
    typeof (owner as Record<string, unknown>).login === "string" &&
    isNullableString((owner as Record<string, unknown>).avatar_url) &&
    typeof (owner as Record<string, unknown>).html_url === "string"
  );
}

function isGitHubLanguagesResponse(
  value: unknown,
): value is Record<string, number> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).every((languageBytes) => typeof languageBytes === "number")
  );
}

function isGitHubBranchesResponse(
  value: unknown,
): value is Array<{ name: string; protected: boolean }> {
  return (
    Array.isArray(value) &&
    value.every(
      (branch) =>
        typeof branch === "object" &&
        branch !== null &&
        typeof (branch as Record<string, unknown>).name === "string" &&
        typeof (branch as Record<string, unknown>).protected === "boolean",
    )
  );
}

function isGitHubCommitsResponse(
  value: unknown,
): value is Array<{
  sha: string;
  html_url: string;
  author: {
    login: string;
    avatar_url: string | null;
    html_url: string;
  } | null;
  commit: {
    message: string;
    author: {
      date: string;
    };
  };
}> {
  return (
    Array.isArray(value) &&
    value.every((commit) => {
      if (typeof commit !== "object" || commit === null) {
        return false;
      }

      const item = commit as Record<string, unknown>;
      const author = item.author;
      const commitDetails = item.commit;

      return (
        typeof item.sha === "string" &&
        typeof item.html_url === "string" &&
        (author === null || isGitHubCommitAuthor(author)) &&
        isGitHubCommitDetails(commitDetails)
      );
    })
  );
}

function isGitHubCommitAuthor(
  value: unknown,
): value is {
  login: string;
  avatar_url: string | null;
  html_url: string;
} {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const author = value as Record<string, unknown>;
  return (
    typeof author.login === "string" &&
    isNullableString(author.avatar_url) &&
    typeof author.html_url === "string"
  );
}

function isGitHubCommitDetails(
  value: unknown,
): value is { message: string; author: { date: string } } {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const commit = value as Record<string, unknown>;
  const author = commit.author;
  return (
    typeof commit.message === "string" &&
    typeof author === "object" &&
    author !== null &&
    typeof (author as Record<string, unknown>).date === "string"
  );
}

function isGitHubPullRequestsResponse(
  value: unknown,
): value is Array<{
  number: number;
  title: string;
  state: "open" | "closed";
  user: {
    login: string;
    avatar_url: string | null;
    html_url: string;
  } | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  html_url: string;
}> {
  return (
    Array.isArray(value) &&
    value.every((pullRequest) => {
      if (typeof pullRequest !== "object" || pullRequest === null) {
        return false;
      }

      const item = pullRequest as Record<string, unknown>;
      const user = item.user;

      return (
        typeof item.number === "number" &&
        typeof item.title === "string" &&
        (item.state === "open" || item.state === "closed") &&
        (user === null || isGitHubCommitAuthor(user)) &&
        typeof item.created_at === "string" &&
        typeof item.updated_at === "string" &&
        isNullableString(item.closed_at) &&
        isNullableString(item.merged_at) &&
        typeof item.html_url === "string"
      );
    })
  );
}

function isGitHubIssueResponse(
  value: unknown,
): value is {
  number: number;
  title: string;
  state: "open" | "closed";
  user?: unknown;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  labels?: unknown;
  html_url: string;
} {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const issue = value as Record<string, unknown>;
  return (
    typeof issue.number === "number" &&
    typeof issue.title === "string" &&
    (issue.state === "open" || issue.state === "closed") &&
    typeof issue.created_at === "string" &&
    typeof issue.updated_at === "string" &&
    isNullableString(issue.closed_at) &&
    typeof issue.html_url === "string"
  );
}

function toGitHubAuthor(value: unknown): GitHubCommit["author"] {
  return isGitHubCommitAuthor(value)
    ? {
        login: value.login,
        displayName: null,
        avatarUrl: value.avatar_url,
        profileUrl: value.html_url,
      }
    : null;
}

function toGitHubIssueLabels(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((label) => {
    if (typeof label !== "object" || label === null) {
      return [];
    }

    const name = (label as Record<string, unknown>).name;
    return typeof name === "string" ? [name] : [];
  });
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}
