import { CONFIDENCE_THRESHOLDS, type QuestionType } from "@/lib/constants";

/** Scope inferred from the target referenced by a question. */
export type QuestionScope = "file" | "component" | "repository" | "unknown";

/** Structured result produced by the rule-based question classifier. */
export interface QuestionClassification {
  /** Inferred Engineering Memory intent. */
  intent: QuestionType;
  /** Deterministic confidence score on a 0–1 scale. */
  confidence: number;
  /** Referenced file, code identifier, or natural-language target when found. */
  detectedTarget: string | null;
  /** Inferred scope of the detected target. */
  scope: QuestionScope;
}

/** Compatibility alias for code that imports the former category type. */
export type QuestionCategory = QuestionType;

const INTENT_KEYWORDS: Record<QuestionType, string[]> = {
  WHY_INTRODUCED: [
    "why introduced",
    "why was introduced",
    "why added",
    "why was added",
    "why created",
    "why was created",
    "reason for introducing",
    "reason for adding",
  ],
  WHY_CHANGED: [
    "why changed",
    "why was changed",
    "why modified",
    "why was modified",
    "why updated",
    "why was updated",
    "reason for changing",
    "reason for updating",
  ],
  BREAKAGE: [
    "breakage",
    "broken",
    "breaks",
    "bug",
    "error",
    "failure",
    "failing",
    "regression",
    "not working",
  ],
  RELEVANCE: [
    "relevant",
    "relevance",
    "impact",
    "affect",
    "affected",
    "used by",
    "uses ",
    "where used",
  ],
  UNKNOWN: [],
};

const INTENT_PRIORITY: QuestionType[] = [
  "WHY_INTRODUCED",
  "WHY_CHANGED",
  "BREAKAGE",
  "RELEVANCE",
];

const INTENT_PATTERNS: Partial<Record<QuestionType, RegExp>> = {
  WHY_INTRODUCED:
    /\bwhy\s+(?:was|did)\b.*\b(introduced|added|created)\b/i,
  WHY_CHANGED:
    /\bwhy\s+(?:was|did)\b.*\b(change|changed|modified|updated)\b/i,
  BREAKAGE: /\b(break|breaks|broken|fails|failing|error|regression)\b/i,
  RELEVANCE:
    /\b(needed|need|used|use|depends?|components?|impact|affected|relevant)\b/i,
};

/** Returns matching keywords for a question and a classification intent. */
function getMatchingKeywords(question: string, intent: QuestionType): string[] {
  const matches = INTENT_KEYWORDS[intent].filter((keyword) =>
    question.includes(keyword),
  );
  const pattern = INTENT_PATTERNS[intent];

  if (pattern?.test(question)) {
    matches.push("intent pattern");
  }

  return matches;
}

/** Detects an explicitly named file, code reference, or change target. */
function detectTarget(question: string): string | null {
  const codeReference = question.match(/`([^`]+)`/);

  if (codeReference) {
    return codeReference[1];
  }

  const filePath = question.match(
    /\b(?:[\w-]+\/)*[\w-]+\.(?:ts|tsx|js|jsx|json|md|yml|yaml)\b/i,
  );

  if (filePath) {
    return filePath[0];
  }

  const changeTarget = question.match(
    /why\s+(?:(?:was|did)\s+)?(.+?)\s+(?:introduced|added|created|changed|modified|updated)\b/i,
  );

  return changeTarget?.[1]?.trim() ?? null;
}

/** Infers the scope represented by the detected target and question wording. */
function inferScope(
  question: string,
  detectedTarget: string | null,
): QuestionScope {
  if (
    detectedTarget &&
    /(?:[\w-]+\/)*[\w-]+\.(?:ts|tsx|js|jsx|json|md|yml|yaml)$/i.test(
      detectedTarget,
    )
  ) {
    return "file";
  }

  if (detectedTarget) {
    return "component";
  }

  if (/\b(repository|project|codebase|service)\b/i.test(question)) {
    return "repository";
  }

  return "unknown";
}

/**
 * Classifies a question with deterministic keyword rules. It never calls
 * Gemini or another external service.
 */
export function classifyQuestion(question: string): QuestionClassification {
  const normalizedQuestion = question.toLowerCase();
  const detectedTarget = detectTarget(question);
  let intent: QuestionType = "UNKNOWN";
  let matchingKeywords: string[] = [];

  for (const candidate of INTENT_PRIORITY) {
    const matches = getMatchingKeywords(normalizedQuestion, candidate);

    if (matches.length > matchingKeywords.length) {
      intent = candidate;
      matchingKeywords = matches;
    }
  }

  return {
    intent,
    confidence:
      intent === "UNKNOWN"
        ? 0
        : Math.min(
            0.95,
            CONFIDENCE_THRESHOLDS.HIGH +
              Math.max(0, matchingKeywords.length - 1) * 0.1,
          ),
    detectedTarget,
    scope: inferScope(question, detectedTarget),
  };
}

/** Returns only the inferred intent for callers using the former API shape. */
export function classifyQuestionType(question: string): QuestionType {
  return classifyQuestion(question).intent;
}
