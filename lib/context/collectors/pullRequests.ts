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

  return pullRequests.map(({ updatedAt: _updatedAt, ...pullRequest }) => ({
    ...pullRequest,
    // Bodies and file changes are intentionally omitted to keep collection to
    // the single lightweight list request.
    body: null,
    files: [],
  }));
}
