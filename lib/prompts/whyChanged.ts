/** Instructions for investigating why a repository element changed. */
export const WHY_CHANGED_PROMPT = `## Analysis Focus: Why Changed

- Identify the triggering requirement, incident, regression, or trade-off that
  led to the change.
- Use commits, linked issues, and merged pull requests to distinguish the
  original decision from the later reason for revising it.
- Explain the decision’s intended impact only where evidence connects the
  change to that impact.
- Do not provide a line-by-line implementation summary unless it is necessary
  to explain the motivation.
- Mark any proposed causal chain as an **Inference** when it is not explicitly
  documented.
- State whether the trade-off that prompted the revision is documented,
  inferred, or unavailable.`;
