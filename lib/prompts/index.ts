import type { RepositoryContext } from "@/lib/types";

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

## Instructions
${analysisInstructions}
- Base conclusions only on the repository context and evidence provided to you.
- Clearly distinguish confirmed facts from inferences.
- Do not invent commits, files, dates, or motivations.

## Response Format
### Summary
Provide a concise direct answer.

### Evidence
List supporting files, commits, or code references. State "No supporting evidence provided" when needed.

### Timeline
List relevant events in chronological order. State "No timeline available" when needed.

### Risks
List uncertainty, assumptions, and potential side effects. State "No material risks identified" when needed.

### Confidence
State **High**, **Medium**, or **Low** and briefly explain why.

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
    "- Identify the problem or requirement the introduction appears to address.\n- Connect the introduction to the earliest available supporting evidence.\n- Explain the resulting behavior or capability.",
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
    "Explain the motivation and effect of a change to an existing repository element.",
    "- Compare the behavior before and after the change when evidence permits.\n- Identify the problem, requirement, or trade-off motivating the change.\n- Describe downstream behavior affected by the change.",
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
    "Analyze a reported breakage, failure, or regression in the repository.",
    "- Identify the observed symptom and likely affected area.\n- Trace likely contributing changes or conditions from the available evidence.\n- Separate verified cause from plausible hypotheses and note missing evidence.",
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
    "Assess how the referenced repository element is used and why it matters.",
    "- Identify the component, workflow, or behavior connected to the subject.\n- Describe direct and indirect consumers or dependencies when evidence permits.\n- Explain the impact of modifying or removing the subject.",
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
    "Answer the repository question using only the available context and evidence.",
    "- Identify the repository element or behavior the question concerns.\n- Explain what can be confirmed from the available evidence.\n- State which details cannot be determined from the available context.",
  );
}
