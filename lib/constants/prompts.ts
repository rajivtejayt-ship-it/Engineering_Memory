/** Stable names for the Engineering Memory prompt templates. */
export const PROMPT_NAMES = {
  WHY_INTRODUCED: "why-introduced",
  WHY_CHANGED: "why-changed",
  BREAKAGE_ANALYSIS: "breakage-analysis",
  RELEVANCE_ANALYSIS: "relevance-analysis",
  UNKNOWN: "unknown",
} as const;

/** A value from the available Engineering Memory prompt template names. */
export type PromptName = (typeof PROMPT_NAMES)[keyof typeof PROMPT_NAMES];
