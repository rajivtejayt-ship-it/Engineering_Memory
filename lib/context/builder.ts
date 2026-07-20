import { collectCommits } from "./collectors/commits";
import { collectIssues } from "./collectors/issues";
import { collectRepositoryMetadata } from "./collectors/metadata";
import { collectPullRequests } from "./collectors/pullRequests";
import { collectRiskAreas } from "./collectors/risk";
import { collectTimeline } from "./collectors/timeline";
import type { RepositoryContext } from "@/types/context";

/** Builds the available repository metadata and lightweight commit context. */
export async function buildRepositoryContext(
  owner: string,
  repository: string,
): Promise<RepositoryContext> {
  const [metadata, commits, pullRequests, issues] = await Promise.all([
    collectRepositoryMetadata({ owner, repository }),
    collectCommits({ owner, repository }),
    collectPullRequests({ owner, repository }),
    collectIssues({ owner, repository }),
  ]);
  const timeline = collectTimeline({ commits, pullRequests, issues });
  const riskAreas = collectRiskAreas({
    commits,
    pullRequests,
    issues,
    timeline,
  });

  return {
    repository: metadata,
    commits,
    pullRequests,
    issues,
    discussions: [],
    relatedFiles: [],
    riskAreas,
    timeline,
  };
}
