import type {
  RankedEvidence,
  RetrievalResult,
} from ".";

/**
 * Removes repeated repository records while preserving the strongest ranking
 * score and all distinct reasons that support the surviving record.
 */
export class EvidenceDeduplicator {
  /** Returns a clean retrieval result without duplicate source records. */
  deduplicate(result: RetrievalResult): RetrievalResult {
    return {
      ...result,
      commits: deduplicateRankedEvidence(result.commits, (commit) => commit.id),
      pullRequests: deduplicateRankedEvidence(
        result.pullRequests,
        (pullRequest) => String(pullRequest.number),
      ),
      issues: deduplicateRankedEvidence(result.issues, (issue) =>
        String(issue.number),
      ),
      documentation: deduplicateRankedEvidence(
        result.documentation,
        (document) => document.path,
      ),
    };
  }
}

/** Convenience function for callers that do not need an adapter instance. */
export function deduplicateRetrievalResult(
  result: RetrievalResult,
): RetrievalResult {
  return new EvidenceDeduplicator().deduplicate(result);
}

/**
 * Merges duplicate ranked records by their stable source identifier. When
 * scores differ, the higher-scored record supplies the item and score. Ties
 * keep the first input record, making the result deterministic.
 */
export function deduplicateRankedEvidence<T>(
  evidence: RankedEvidence<T>[],
  getId: (item: T) => string,
): RankedEvidence<T>[] {
  const evidenceById = new Map<string, RankedEvidence<T>>();

  for (const candidate of evidence) {
    const id = getId(candidate.item);
    const existing = evidenceById.get(id);

    if (!existing) {
      evidenceById.set(id, {
        ...candidate,
        reasons: [...new Set(candidate.reasons)],
      });
      continue;
    }

    const strongest = candidate.score > existing.score ? candidate : existing;
    evidenceById.set(id, {
      item: strongest.item,
      score: strongest.score,
      reasons: [...new Set([...existing.reasons, ...candidate.reasons])],
    });
  }

  return [...evidenceById.values()];
}
