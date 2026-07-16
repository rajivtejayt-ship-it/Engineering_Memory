import { getRepository } from "@/lib/github/client";
import type { RepositoryMetadata } from "@/types/repository";

export interface MetadataCollectorInput {
  owner: string;
  repository: string;
}

/** Builds the repository metadata section of a RepositoryContext. */
export async function collectRepositoryMetadata(
  input: MetadataCollectorInput,
): Promise<RepositoryMetadata> {
  const repository = await getRepository({
    owner: input.owner,
    name: input.repository,
  });

  return {
    owner: repository.ownerProfile,
    name: repository.name,
    fullName: repository.fullName,
    url: repository.url,
    description: repository.description,
    defaultBranch: repository.defaultBranch,
    createdAt: repository.createdAt,
    updatedAt: repository.updatedAt,
    statistics: repository.statistics,
    languages: repository.languages,
    branches: repository.branches,
  };
}
