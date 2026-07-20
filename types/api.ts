import type { AIAnswer } from "./agent";
import type { CodeLocation } from "./github";
import type { RepositoryMetadata } from "./repository";

/** Request body for POST /api/import. */
export interface ImportRepositoryRequest {
  readonly repositoryUrl: string;
}

/** Shared lifecycle status returned by import endpoints. */
export interface ImportJobStatus {
  readonly status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
}

/** Response body for POST /api/import. */
export interface ImportRepositoryResponse extends ImportJobStatus {
  readonly repositoryId: string;
  readonly importJobId: string;
  readonly message: string;
}

/** Response body for GET /api/repositories. */
export interface ListRepositoriesResponse {
  readonly repositories: readonly RepositoryMetadata[];
}

/** Path parameters for GET /api/imports/:jobId. */
export interface GetImportJobRequest {
  readonly jobId: string;
}

/** Response body for GET /api/imports/:jobId. */
export interface GetImportJobResponse extends ImportJobStatus {
  readonly progress: number;
  readonly errorMessage: string | null;
}

/** Request body for POST /api/ask. */
export interface AskRepositoryRequest {
  readonly repositoryId: string;
  readonly question: string;
  readonly codeLocations?: readonly CodeLocation[];
}

/** Response body for POST /api/ask. */
export interface AskRepositoryResponse {
  readonly answer: AIAnswer;
}
