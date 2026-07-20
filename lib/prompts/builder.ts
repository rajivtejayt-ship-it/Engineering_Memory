import type { QuestionType } from "@/lib/constants";
import type { ContextEvidence, ContextPackage } from "@/lib/context";
import { BREAKAGE_PROMPT } from "./breakage";
import { RELEVANCE_PROMPT } from "./relevance";
import { SYSTEM_PROMPT } from "./system";
import { WHY_CHANGED_PROMPT } from "./whyChanged";
import { WHY_INTRODUCED_PROMPT } from "./whyIntroduced";

/** Reusable system instructions for each Engineering Memory question type. */
export const SYSTEM_PROMPTS: Record<QuestionType, string> = {
  WHY_INTRODUCED: `${SYSTEM_PROMPT}\n\n${WHY_INTRODUCED_PROMPT}`,
  WHY_CHANGED: `${SYSTEM_PROMPT}\n\n${WHY_CHANGED_PROMPT}`,
  BREAKAGE: `${SYSTEM_PROMPT}\n\n${BREAKAGE_PROMPT}`,
  RELEVANCE: `${SYSTEM_PROMPT}\n\n${RELEVANCE_PROMPT}`,
  UNKNOWN: `${SYSTEM_PROMPT}\n\n## Analysis Focus: Unknown\n\nDescribe only what the supplied evidence can establish. Do not infer a reason when the question or evidence is ambiguous.`,
};

/** Returns the reusable system instruction for a classified question type. */
export function getSystemPrompt(questionType: QuestionType): string {
  return SYSTEM_PROMPTS[questionType];
}

/** Formats one compact context evidence item as Markdown for Gemini. */
function formatEvidenceItem(evidence: ContextEvidence): string {
  const occurredAt = evidence.occurredAt ?? "Date unavailable";
  const reasons = evidence.relevanceReasons.join("; ") || "No ranking reason recorded";

  return `### ${evidence.source}: ${evidence.title}
- **ID:** ${evidence.id}
- **Date:** ${occurredAt}
- **Summary:** ${evidence.summary}
- **Relevance:** ${reasons}`;
}

/** Formats the bounded evidence from a context package for prompt injection. */
export function formatRepositoryEvidence(contextPackage: ContextPackage): string {
  if (contextPackage.evidence.length === 0) {
    return "No repository evidence was retrieved.";
  }

  const truncationNotice = contextPackage.truncated
    ? "\n\n> Note: Evidence was truncated to fit the prompt budget."
    : "";

  return `${contextPackage.evidence.map(formatEvidenceItem).join("\n\n")}${truncationNotice}`;
}

/**
 * Builds one final Gemini input from a question type and prepared context.
 * This module only builds prompts; it does not call Gemini or retrieve data.
 */
export function buildGeminiPrompt(
  questionType: QuestionType,
  contextPackage: ContextPackage,
  question = "No user question was supplied.",
): string {
  const { repositoryContext } = contextPackage;

  return `# System Instructions
${getSystemPrompt(questionType)}

## Analysis Constraints
- Use only the repository evidence supplied below.
- Explain historical rationale, decisions, and trade-offs rather than merely
  describing implementation behavior.
- Cite the supplied evidence ID beside every material claim.
- Reference commit IDs, issue numbers, and pull-request numbers when present.
- Clearly label inferences and explain their supporting evidence.
- State undocumented trade-offs, risks, and motivations as unavailable rather
  than supplying a plausible explanation.
- Never invent commits, pull requests, issues, files, dates, motivations,
  dependencies, or outcomes.

## Repository Context
- **Repository:** ${repositoryContext.repository}
- **Reference:** ${repositoryContext.ref ?? "Not specified"}
- **File path:** ${repositoryContext.filePath ?? "Not specified"}
- **Question type:** ${questionType}

## User Question
${question}

## Retrieved Evidence
${formatRepositoryEvidence(contextPackage)}

## Required Response Format
### Summary
Provide a concise, professional explanation of why the code or decision exists.

### Evidence
List cited evidence IDs, including relevant commits, issues, and PRs, and state
how each supports the explanation.

### Timeline
Describe relevant events in chronological order.

### Risks
List observed risks separately from assumptions, unsupported alternatives, and
potential side effects.

### Confidence
State a **0–100** estimate and explain the rating from evidence
coverage, quality, and any unresolved uncertainty.

### Suggested Next Questions
List useful follow-up questions, or state "None".`;
}
