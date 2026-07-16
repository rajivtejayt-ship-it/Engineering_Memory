/** Supported categories for engineering-history questions. */
export type QuestionCategory =
  | "WHY_INTRODUCED"
  | "WHY_CHANGED"
  | "BREAKAGE"
  | "RELEVANCE"
  | "UNKNOWN";

const WHY_INTRODUCED_KEYWORDS = [
  "why introduced",
  "why was introduced",
  "why added",
  "why was added",
  "why created",
  "why was created",
  "reason for introducing",
  "reason for adding",
];

const WHY_CHANGED_KEYWORDS = [
  "why changed",
  "why was changed",
  "why modified",
  "why was modified",
  "why updated",
  "why was updated",
  "reason for changing",
  "reason for updating",
];

const BREAKAGE_KEYWORDS = [
  "breakage",
  "broken",
  "breaks",
  "bug",
  "error",
  "failure",
  "failing",
  "regression",
  "not working",
];

const RELEVANCE_KEYWORDS = [
  "relevant",
  "relevance",
  "impact",
  "affect",
  "affected",
  "used by",
  "uses ",
  "where used",
];

/** Returns whether a question contains at least one keyword. */
function includesKeyword(question: string, keywords: string[]): boolean {
  return keywords.some((keyword) => question.includes(keyword));
}

/**
 * Classifies a user question using simple, deterministic keyword matching.
 * No model calls or external services are used.
 */
export function classifyQuestion(question: string): QuestionCategory {
  const normalizedQuestion = question.toLowerCase();

  if (includesKeyword(normalizedQuestion, WHY_INTRODUCED_KEYWORDS)) {
    return "WHY_INTRODUCED";
  }

  if (includesKeyword(normalizedQuestion, WHY_CHANGED_KEYWORDS)) {
    return "WHY_CHANGED";
  }

  if (includesKeyword(normalizedQuestion, BREAKAGE_KEYWORDS)) {
    return "BREAKAGE";
  }

  if (includesKeyword(normalizedQuestion, RELEVANCE_KEYWORDS)) {
    return "RELEVANCE";
  }

  return "UNKNOWN";
}
