import { getPullRequests } from "@/lib/github/client";
import type { PullRequestSummary } from "@/types/github";

export interface PullRequestsCollectorInput {
  owner: string;
  repository: string;
}

/** Builds lightweight pull request evidence from GitHub's pulls response. */
export async function collectPullRequests(
  input: PullRequestsCollectorInput,
): Promise<readonly PullRequestSummary[]> {
  const pullRequests = await getPullRequests({
    owner: input.owner,
    name: input.repository,
  });

  return pullRequests.map((pullRequest) => ({
    number: pullRequest.number,
    title: pullRequest.title,
    state: pullRequest.state,
    author: pullRequest.author,
    createdAt: pullRequest.createdAt,
    closedAt: pullRequest.closedAt,
    mergedAt: pullRequest.mergedAt,
    url: pullRequest.url,
    // Bodies and file changes are intentionally omitted to keep collection to
    // the single lightweight list request.
    body: null,
    files: [],
  }));
}
