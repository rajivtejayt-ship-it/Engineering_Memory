import type { RetrievalResult } from "@/lib/retriever";
import type {
  ConfidenceAssessment,
  ExplainabilityInfo,
  TimelineEvent,
} from "@/lib/types";

/** Inputs measured by Core while constructing an answer. */
export interface ExplainabilityInput {
  /** Evidence selected by retrieval. */
  retrievalResult: RetrievalResult;
  /** Timeline returned with the answer. */
  timeline: TimelineEvent[];
  /** Character length of the final model prompt. */
  promptSize: number;
  /** Retrieval and ranking duration in milliseconds. */
  retrievalTimeMs: number;
  /** Context building, model execution, and formatting duration in milliseconds. */
  reasoningTimeMs: number;
  /** Deterministic confidence assessment for the selected evidence. */
  confidence: ConfidenceAssessment;
}

/**
 * Builds stable, model-independent explainability data for every answer.
 * This information is safe for UI display and debugging because it is derived
 * exclusively from retrieval output and measured execution data.
 */
export function generateExplainabilityInfo(
  input: ExplainabilityInput,
): ExplainabilityInfo {
  const { retrievalResult, confidence } = input;
  const evidenceUsed = {
    commitIds: retrievalResult.commits.map((entry) => entry.item.id),
    pullRequestNumbers: retrievalResult.pullRequests.map(
      (entry) => entry.item.number,
    ),
    issueNumbers: retrievalResult.issues.map((entry) => entry.item.number),
    documentationPaths: retrievalResult.documentation.map(
      (entry) => entry.item.path,
    ),
  };

  return {
    evidenceUsed: {
      ...evidenceUsed,
      total:
        evidenceUsed.commitIds.length +
        evidenceUsed.pullRequestNumbers.length +
        evidenceUsed.issueNumbers.length +
        evidenceUsed.documentationPaths.length,
    },
    timelineLength: input.timeline.length,
    promptSize: input.promptSize,
    retrievalTimeMs: input.retrievalTimeMs,
    reasoningTimeMs: input.reasoningTimeMs,
    confidence,
    reasoningQuality: getReasoningQuality(confidence),
  };
}

function getReasoningQuality(
  confidence: ConfidenceAssessment,
): ExplainabilityInfo["reasoningQuality"] {
  if (confidence.level === "HIGH") {
    return {
      level: "HIGH",
      explanation:
        "Reasoning is well supported by multiple consistent repository signals.",
    };
  }
  if (confidence.level === "MEDIUM") {
    return {
      level: "MEDIUM",
      explanation:
        "Reasoning has useful evidence support, with remaining gaps or uncertainty.",
    };
  }

  return {
    level: "LOW",
    explanation:
      "Reasoning is constrained by sparse, conflicting, or incomplete repository evidence.",
  };
}
