/** Supported categories for Engineering Memory questions. */
export const QUESTION_TYPES = {
  WHY_INTRODUCED: "WHY_INTRODUCED",
  WHY_CHANGED: "WHY_CHANGED",
  BREAKAGE: "BREAKAGE",
  RELEVANCE: "RELEVANCE",
  UNKNOWN: "UNKNOWN",
} as const;

/** A value from the supported Engineering Memory question categories. */
export type QuestionType =
  (typeof QUESTION_TYPES)[keyof typeof QUESTION_TYPES];
