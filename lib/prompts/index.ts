import type { RepositoryContext } from "@/lib/types";
import { SYSTEM_PROMPT } from "./system";

export {
  buildGeminiPrompt,
  formatRepositoryEvidence,
  getSystemPrompt,
  SYSTEM_PROMPTS,
} from "./builder";
export { BREAKAGE_PROMPT } from "./breakage";
export { RELEVANCE_PROMPT } from "./relevance";
export { SYSTEM_PROMPT } from "./system";
export { WHY_CHANGED_PROMPT } from "./whyChanged";
export { WHY_INTRODUCED_PROMPT } from "./whyIntroduced";

function formatRepositoryContext(context: RepositoryContext): string {
  const reference = context.ref ?? "Not specified";
  const filePath = context.filePath ?? "Not specified";

  return `## Repository Context
- **Repository:** ${context.repository}
- **Reference:** ${reference}
- **File path:** ${filePath}`;
}

function buildPrompt(
  question: string,
  repositoryContext: RepositoryContext,
  objective: string,
  analysisInstructions: string,
): string {
  return `# Engineering Memory Analysis

## Objective
${objective}

${formatRepositoryContext(repositoryContext)}

## User Question
${question}

## Evidence-Led Analysis Instructions
${SYSTEM_PROMPT}

## Question-Specific Instructions
${analysisInstructions}

## Response Format
### Summary
Explain the historical rationale and trade-offs, not a feature description.

### Evidence
For every material claim, cite the supplied evidence ID. Reference commit IDs,
issue numbers, and PR numbers when they are available. State "No supporting
evidence provided" when necessary.

### Timeline
List only supported events in chronological order. State "No timeline available"
when needed.

### Risks
List uncertainty, assumptions, and potential side effects. Label inferences and
state missing evidence. State "No material risks identified" when needed.

### Confidence
State a **0–100** estimate and explain the rating from the evidence.

### Suggested Next Questions
List useful follow-up questions, or state "None".`;
}

/** Builds a prompt for explaining why a repository element was introduced. */
export function buildWhyIntroducedPrompt(
  question: string,
  repositoryContext: RepositoryContext,
): string {
  return buildPrompt(
    question,
    repositoryContext,
    "Explain the original motivation for introducing the relevant code, configuration, or dependency.",
    "- Identify the original problem, requirement, incident, or architectural decision.\n- Prefer the earliest commit, issue, or merged PR that documents intent.\n- Describe trade-offs only when supported by evidence; label any inference.",
  );
}

/** Builds a prompt for explaining why a repository element changed. */
export function buildWhyChangedPrompt(
  question: string,
  repositoryContext: RepositoryContext,
): string {
  return buildPrompt(
    question,
    repositoryContext,
    "Explain why an existing repository decision was revised.",
    "- Identify the triggering requirement, incident, regression, or trade-off.\n- Use linked commits, issues, and PRs to distinguish confirmed motivation from inference.\n- Do not replace historical rationale with an implementation walkthrough.",
  );
}

/** Builds a prompt for investigating a reported breakage or regression. */
export function buildBreakageAnalysisPrompt(
  question: string,
  repositoryContext: RepositoryContext,
): string {
  return buildPrompt(
    question,
    repositoryContext,
    "Explain the historical decisions and evidence relevant to a reported breakage, failure, or regression.",
    "- Establish the reported symptom from evidence.\n- Trace only supported contributing changes or conditions.\n- Separate verified causes from hypotheses and specify the missing confirming evidence.",
  );
}

/** Builds a prompt for assessing the relevance and impact of repository code. */
export function buildRelevanceAnalysisPrompt(
  question: string,
  repositoryContext: RepositoryContext,
): string {
  return buildPrompt(
    question,
    repositoryContext,
    "Assess why the referenced repository element remains relevant to an engineering decision or dependency.",
    "- Establish direct evidence of relevance before indirect impact.\n- Distinguish current relevance from historical relevance.\n- Do not claim removal is safe or unsafe without supporting evidence.",
  );
}

/** Builds a general prompt when a question does not match a known category. */
export function buildUnknownPrompt(
  question: string,
  repositoryContext: RepositoryContext,
): string {
  return buildPrompt(
    question,
    repositoryContext,
    "Answer the repository question as an evidence-led explanation of engineering intent.",
    "- Explain what the evidence can establish about why the code or decision exists.\n- Cite all material claims and label inferences.\n- State which details cannot be determined from the available context.",
  );
}
