import { collectRepositoryMetadata } from "./collectors/metadata";
import type { RepositoryContext } from "@/types/context";

/** Builds the current metadata-only RepositoryContext. */
export async function buildRepositoryContext(
  owner: string,
  repository: string,
): Promise<RepositoryContext> {
  const metadata = await collectRepositoryMetadata({ owner, repository });

  return {
    repository: metadata,
    commits: [],
    pullRequests: [],
    issues: [],
    discussions: [],
    relatedFiles: [],
    riskAreas: [],
    timeline: [],
  };
}
