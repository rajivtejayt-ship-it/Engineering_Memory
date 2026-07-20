import type { RetrievalResult } from "@/lib/retriever";
import type { AIResponse, Evidence, SourceAttribution, TimelineEvent } from "@/lib/types";

/** Builds frontend-ready source records from the repository evidence selected. */
export function createSourceAttributions(
  retrievalResult: RetrievalResult,
): SourceAttribution[] {
  return [
    ...retrievalResult.commits.map((commit) => ({
      id: `commit:${commit.item.id}`,
      type: "commit" as const,
      commitId: commit.item.id,
      summary: commit.item.message,
      location: commit.item.files.join(", ") || undefined,
    })),
    ...retrievalResult.pullRequests.map((pullRequest) => ({
      id: `pull-request:${pullRequest.item.number}`,
      type: "pull-request" as const,
      pullRequestNumber: pullRequest.item.number,
      summary: pullRequest.item.title,
    })),
    ...retrievalResult.issues.map((issue) => ({
      id: `issue:${issue.item.number}`,
      type: "issue" as const,
      issueNumber: issue.item.number,
      summary: issue.item.title,
    })),
  ];
}

/**
 * Adds source records to a formatted response and links Gemini evidence and
 * timeline entries to only the source IDs they explicitly cite.
 */
export function attachSourceAttribution(
  response: AIResponse,
  retrievalResult: RetrievalResult,
): AIResponse {
  const sources = createSourceAttributions(retrievalResult);
  const availableSourceIds = new Set(sources.map((source) => source.id));

  return {
    ...response,
    evidence: attachEvidenceSourceIds(response.evidence, availableSourceIds),
    timeline: attachTimelineSourceIds(response.timeline, availableSourceIds),
    sources,
  };
}

/** Extracts known commit, PR, and issue IDs cited in a Markdown text fragment. */
export function extractCitedSourceIds(
  content: string,
  availableSourceIds: ReadonlySet<string>,
): string[] {
  const citationPattern = /\b(commit|pull-request|issue):([A-Za-z0-9._/-]+)\b/g;
  const sourceIds = new Set<string>();

  for (const match of content.matchAll(citationPattern)) {
    const sourceId = `${match[1]}:${match[2]}`;
    if (availableSourceIds.has(sourceId)) {
      sourceIds.add(sourceId);
    }
  }

  return [...sourceIds];
}

function attachEvidenceSourceIds(
  evidence: Evidence[] | undefined,
  availableSourceIds: ReadonlySet<string>,
): Evidence[] | undefined {
  return evidence?.map((item) => ({
    ...item,
    sourceIds: mergeKnownSourceIds(
      item.sourceIds,
      extractCitedSourceIds(item.content, availableSourceIds),
      availableSourceIds,
    ),
  }));
}

function attachTimelineSourceIds(
  timeline: TimelineEvent[] | undefined,
  availableSourceIds: ReadonlySet<string>,
): TimelineEvent[] | undefined {
  return timeline?.map((item) => ({
    ...item,
    evidenceIds: mergeKnownSourceIds(
      item.evidenceIds,
      extractCitedSourceIds(item.summary, availableSourceIds),
      availableSourceIds,
    ),
  }));
}

/** Preserves valid caller-provided IDs while adding IDs explicitly cited in text. */
function mergeKnownSourceIds(
  existingSourceIds: string[] | undefined,
  citedSourceIds: string[],
  availableSourceIds: ReadonlySet<string>,
): string[] {
  return [
    ...new Set([
      ...(existingSourceIds ?? []).filter((id) => availableSourceIds.has(id)),
      ...citedSourceIds,
    ]),
  ];
}
