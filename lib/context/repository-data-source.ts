import { getPrisma } from "@/lib/prisma";
import type { RepositoryDataSource, RepositoryEvidenceData } from "@/lib/retriever";
import type { RepositoryContext as RetrievalRepositoryContext } from "@/lib/types";
import { adaptCollectorRepositoryContext } from "./collector-retrieval-adapter";
import { buildRepositoryContext } from "./builder";
import type { RepositoryContext as CollectedRepositoryContext } from "@/types/context";

interface ImportedRepository {
  owner: string;
  name: string;
}

interface ProductionRepositoryDataSourceDependencies {
  findRepositoryById?: (
    repositoryId: string,
  ) => Promise<ImportedRepository | null>;
  collectRepositoryContext?: (
    owner: string,
    repository: string,
  ) => Promise<CollectedRepositoryContext>;
}

/**
 * Loads an imported repository and adapts existing collector output for the
 * retriever. The data source is intentionally injected at the API boundary so
 * the retriever and EngineeringMemoryCore remain provider-independent.
 */
export function createProductionRepositoryDataSource(
  dependencies: ProductionRepositoryDataSourceDependencies = {},
): RepositoryDataSource {
  const findRepositoryById =
    dependencies.findRepositoryById ??
    (async (repositoryId: string): Promise<ImportedRepository | null> => {
      const repository = await getPrisma().repository.findUnique({
        where: { id: repositoryId },
        select: { owner: true, name: true },
      });

      return repository;
    });
  const collectRepositoryContext =
    dependencies.collectRepositoryContext ?? buildRepositoryContext;

  return {
    async getRepositoryData(
      repositoryContext: RetrievalRepositoryContext,
    ): Promise<RepositoryEvidenceData | undefined> {
      const repository = await findRepositoryById(repositoryContext.repository);
      if (!repository) {
        return undefined;
      }

      const collectedContext = await collectRepositoryContext(
        repository.owner,
        repository.name,
      );

      return adaptCollectorRepositoryContext(collectedContext);
    },
  };
}
