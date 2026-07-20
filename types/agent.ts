import type { CodeLocation } from "./github";

/** A natural-language question about repository history or risk. */
export interface AIQuestion {
  readonly question: string;
  readonly repositoryUrl: string;
  readonly locations: readonly CodeLocation[];
}

/** A source used to support an answer's reasoning. */
export interface ReasoningSource {
  readonly type: "COMMIT" | "PULL_REQUEST" | "ISSUE" | "DISCUSSION" | "FILE";
  readonly title: string;
  readonly url: string;
  readonly location: CodeLocation | null;
}

/** A user-facing reference supporting a specific answer claim. */
export interface Citation {
  readonly label: string;
  readonly url: string;
  readonly location: CodeLocation | null;
}

/** A bounded confidence assessment accompanying an answer. */
export interface ConfidenceScore {
  readonly score: number;
  readonly level: "LOW" | "MEDIUM" | "HIGH";
  readonly rationale: string;
}

/** A structured answer returned by the AI layer. */
export interface AIAnswer {
  readonly answer: string;
  readonly confidence: ConfidenceScore;
  readonly citations: readonly Citation[];
  readonly sources: readonly ReasoningSource[];
}
