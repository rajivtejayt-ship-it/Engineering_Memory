import type { ContextEvidence } from ".";

/** Options used to bound compressed evidence before it is added to a prompt. */
export interface ContextCompressionOptions {
  /** Maximum number of evidence items retained after compression. */
  maxEvidenceItems: number;
  /** Maximum character count for the compact evidence representation. */
  maxCharacters: number;
}

/** Result of compressing a set of context evidence items. */
export interface ContextCompressionResult {
  /** Important evidence retained within the configured size budget. */
  evidence: ContextEvidence[];
  /** Character count of the retained compact representation. */
  characterCount: number;
  /** Whether one or more records or fields were compacted or omitted. */
  truncated: boolean;
}

const MAX_TITLE_CHARACTERS = 240;
const MAX_SUMMARY_CHARACTERS = 700;
const MAX_REASON_CHARACTERS = 180;
const MAX_REASONS = 3;

/**
 * Compresses evidence deterministically while preserving engineering-decision
 * sources first. The returned evidence remains source-neutral and can be
 * chronologically ordered by the context builder before prompt generation.
 */
export function compressContextEvidence(
  evidence: ContextEvidence[],
  options: ContextCompressionOptions,
): ContextCompressionResult {
  const prioritizedEvidence = [...evidence].sort(
    (left, right) =>
      getPriority(right) - getPriority(left) ||
      right.relevanceScore - left.relevanceScore ||
      getTimestamp(right.occurredAt) - getTimestamp(left.occurredAt) ||
      left.id.localeCompare(right.id),
  );
  const compressedEvidence: ContextEvidence[] = [];
  let characterCount = 0;
  let truncated = false;

  for (const item of prioritizedEvidence) {
    const compactItem = compactEvidence(item);
    const compactItemCharacterCount = getEvidenceCharacterCount(compactItem);
    const itemWasCompacted = compactItemCharacterCount !== getEvidenceCharacterCount(item);

    if (
      compressedEvidence.length >= options.maxEvidenceItems ||
      characterCount + compactItemCharacterCount > options.maxCharacters
    ) {
      truncated = true;
      continue;
    }

    compressedEvidence.push(compactItem);
    characterCount += compactItemCharacterCount;
    truncated ||= itemWasCompacted;
  }

  return { evidence: compressedEvidence, characterCount, truncated };
}

/** Returns the estimated Markdown payload size for a compact evidence record. */
export function getEvidenceCharacterCount(evidence: ContextEvidence): number {
  return [
    evidence.source,
    evidence.title,
    evidence.summary,
    evidence.occurredAt ?? "",
    evidence.relevanceReasons.join(" "),
  ].join("\n").length;
}

function compactEvidence(evidence: ContextEvidence): ContextEvidence {
  return {
    ...evidence,
    title: truncate(evidence.title, MAX_TITLE_CHARACTERS),
    summary: truncate(evidence.summary, MAX_SUMMARY_CHARACTERS),
    relevanceReasons: evidence.relevanceReasons
      .slice(0, MAX_REASONS)
      .map((reason) => truncate(reason, MAX_REASON_CHARACTERS)),
  };
}

function getPriority(evidence: ContextEvidence): number {
  return evidence.compressionPriority ?? 0;
}

function getTimestamp(occurredAt: string | undefined): number {
  const timestamp = occurredAt ? Date.parse(occurredAt) : Number.NaN;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function truncate(value: string, maximumLength: number): string {
  if (value.length <= maximumLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maximumLength - 1))}…`;
}
