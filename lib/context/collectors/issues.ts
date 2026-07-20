import { getIssues } from "@/lib/github/client";
import type { IssueSummary } from "@/types/github";

export interface IssuesCollectorInput {
  owner: string;
  repository: string;
}

/** Builds lightweight issue evidence from GitHub's issues response. */
export async function collectIssues(
  input: IssuesCollectorInput,
): Promise<readonly IssueSummary[]> {
  const issues = await getIssues({
    owner: input.owner,
    name: input.repository,
  });

  return issues.map(({ updatedAt: _updatedAt, labels: _labels, ...issue }) => ({
    ...issue,
    // Issue bodies are intentionally omitted to keep the collector lightweight.
    body: null,
  }));
}
