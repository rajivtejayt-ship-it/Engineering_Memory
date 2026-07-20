import type { RepositoryContext } from "@/lib/types";

/** Error raised when an API response cannot be represented as repository context. */
export class RepositoryAdapterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RepositoryAdapterError";
  }
}

/** Converts a backend-specific repository response into the AI-facing context. */
export interface RepositoryAdapter {
  /**
   * Produces normalized repository context from an untrusted API response.
   * Implementations must reject responses that lack a repository identity.
   */
  toRepositoryContext(response: unknown): RepositoryContext;
}

/**
 * Provider-neutral adapter for common repository API field conventions.
 *
 * It intentionally understands only context metadata, not GitHub, Prisma, or
 * any retrieval implementation. Backend clients can use this adapter directly
 * or implement RepositoryAdapter for provider-specific response shapes.
 */
export class RepositoryApiAdapter implements RepositoryAdapter {
  toRepositoryContext(response: unknown): RepositoryContext {
    const payload = asRecord(response);
    if (!payload) {
      throw new RepositoryAdapterError(
        "Repository API response must be an object.",
      );
    }

    const nestedRepository = asRecord(payload.repository);
    const repository = firstNonEmptyString(
      payload.repository,
      payload.fullName,
      payload.full_name,
      nestedRepository?.fullName,
      nestedRepository?.full_name,
      createRepositoryIdentifier(payload.owner, payload.name),
      createRepositoryIdentifier(nestedRepository?.owner, nestedRepository?.name),
      payload.name,
      nestedRepository?.name,
    );

    if (!repository) {
      throw new RepositoryAdapterError(
        "Repository API response is missing a repository identifier.",
      );
    }

    const ref = firstNonEmptyString(
      payload.ref,
      payload.defaultBranch,
      payload.default_branch,
      nestedRepository?.ref,
      nestedRepository?.defaultBranch,
      nestedRepository?.default_branch,
    );
    const filePath = normalizeFilePath(
      firstNonEmptyString(payload.filePath, payload.file_path, payload.path),
    );

    return {
      repository,
      ...(ref ? { ref } : {}),
      ...(filePath ? { filePath } : {}),
    };
  }
}

/** Adapts a raw API response using the default provider-neutral adapter. */
export function toRepositoryContext(response: unknown): RepositoryContext {
  return new RepositoryApiAdapter().toRepositoryContext(response);
}

/** Returns a record only for non-null, non-array object values. */
function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

/** Selects the first non-empty string from a list of possible API fields. */
function firstNonEmptyString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

/** Builds an owner/name identifier only when both API fields are valid strings. */
function createRepositoryIdentifier(owner: unknown, name: unknown): string | undefined {
  const normalizedOwner = firstNonEmptyString(owner);
  const normalizedName = firstNonEmptyString(name);

  return normalizedOwner && normalizedName
    ? `${normalizedOwner}/${normalizedName}`
    : undefined;
}

/** Removes a leading slash while retaining a repository-relative file path. */
function normalizeFilePath(filePath: string | undefined): string | undefined {
  if (!filePath) {
    return undefined;
  }

  const normalizedPath = filePath.replace(/^\/+/, "");
  return normalizedPath || undefined;
}
