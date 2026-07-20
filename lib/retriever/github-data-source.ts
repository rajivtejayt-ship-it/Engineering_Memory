import { getCommits, getIssues, getPullRequests } from "@/lib/github/client";
import type { RepositoryContext } from "@/lib/types";
import type {
  RepositoryDataSource,
  RepositoryEvidenceData,
} from "@/lib/retriever";

/** Converts an owner/name value or GitHub URL into a GitHub API reference. */
function parseRepositoryReference(repository: string):
  | { owner: string; name: string }
  | undefined {
  const normalized = repository
    .trim()
    .replace(/^https:\/\/github\.com\//, "")
    .replace(/\.git$/, "")
    .replace(/^\//, "");
  const [owner, name, ...remaining] = normalized.split("/");

  return owner && name && remaining.length === 0 ? { owner, name } : undefined;
}

/** Extracts GitHub issue references such as #184 from repository history text. */
function issueNumbersIn(text: string): number[] {
  return [...text.matchAll(/#(\d+)/g)].map((match) => Number(match[1]));
}

/**
 * Translates public GitHub history into the provider-neutral data consumed by
 * the retriever. It has no Engineering Memory-specific ranking or AI logic.
 */
export class GitHubRepositoryDataSource implements RepositoryDataSource {
  async getRepositoryData(
    context: RepositoryContext,
  ): Promise<RepositoryEvidenceData | undefined> {
    const reference = parseRepositoryReference(context.repository);

    if (!reference) {
      return undefined;
    }

    const [commits, pullRequests, issues] = await Promise.all([
      getCommits(reference),
      getPullRequests(reference),
      getIssues(reference),
    ]);

    return {
      commits: commits.map((commit) => ({
        id: commit.sha,
        message: commit.message,
        authoredAt: commit.authoredAt,
        author: commit.author?.login ?? "Unknown contributor",
        // The lightweight endpoint provides no changed-file information.
        files: [],
        issueNumbers: issueNumbersIn(commit.message),
      })),
      pullRequests: pullRequests.map((pullRequest) => ({
        number: pullRequest.number,
        title: pullRequest.title,
        author: pullRequest.author?.login ?? "Unknown contributor",
        status:
          pullRequest.state === "MERGED"
            ? "merged"
            : pullRequest.state === "CLOSED"
              ? "closed"
              : "open",
        createdAt: pullRequest.createdAt,
        ...(pullRequest.mergedAt ? { mergedAt: pullRequest.mergedAt } : {}),
        commitIds: [],
        files: [],
        summary: pullRequest.title,
        issueNumbers: issueNumbersIn(pullRequest.title),
      })),
      issues: issues.map((issue) => ({
        number: issue.number,
        title: issue.title,
        status: issue.state.toLowerCase() as "open" | "closed",
        createdAt: issue.createdAt,
        labels: issue.labels,
        summary: issue.title,
        relatedCommitIds: [],
      })),
      documentation: [],
    };
  }
}
