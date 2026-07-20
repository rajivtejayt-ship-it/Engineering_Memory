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
  if (pathSegments.length !== 2) {
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
): Promise<GitHubRepository> {
  const repositoryUrl = `${GITHUB_API_URL}/repos/${encodeURIComponent(reference.owner)}/${encodeURIComponent(reference.name)}`;
  const response = await fetchGitHub(repositoryUrl);

  if (response.status === 404) {
    throw new Error("GitHub repository was not found.");
  }

  if (!response.ok) {
    throw new Error("GitHub repository metadata could not be fetched.");
  }

  const data: unknown = await response.json();
  if (!isGitHubRepositoryResponse(data)) {
    throw new Error("GitHub returned incomplete repository metadata.");
  }

  const [languagesResponse, branchesResponse] = await Promise.all([
    fetchGitHub(`${repositoryUrl}/languages`),
    fetchGitHub(`${repositoryUrl}/branches?per_page=100`),
  ]);

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

/** TODO: Fetch commits when the RepositoryContext builder is implemented. */
export async function getCommits(): Promise<void> {}

/** TODO: Fetch pull requests when the RepositoryContext builder is implemented. */
export async function getPullRequests(): Promise<void> {}

/** TODO: Fetch issues when the RepositoryContext builder is implemented. */
export async function getIssues(): Promise<void> {}

/** TODO: Fetch discussions when the RepositoryContext builder is implemented. */
export async function getDiscussions(): Promise<void> {}

function fetchGitHub(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "engineering-memory",
      "X-GitHub-Api-Version": "2022-11-28",
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

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}
