import { getCommits } from "@/lib/github/client";
import type { CommitSummary } from "@/types/github";

export interface CommitsCollectorInput {
  owner: string;
  repository: string;
}

/** Builds lightweight commit evidence from GitHub's latest commits response. */
export async function collectCommits(
  input: CommitsCollectorInput,
): Promise<readonly CommitSummary[]> {
  const commits = await getCommits({
    owner: input.owner,
    name: input.repository,
  });

  return commits.map((commit) => ({
    ...commit,
    // File data needs one additional request per commit, so it is intentionally
    // omitted from collection rather than expanding the GitHub request budget.
    files: [],
  }));
}
