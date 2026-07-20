/** Instructions for analyzing a reported breakage or regression. */
export const BREAKAGE_PROMPT = `## Analysis Focus: Breakage

- Identify the reported failure, risk, or regression from issues, commits, or
  pull requests; do not infer a symptom from code alone.
- Trace the supported historical decisions and changes that may explain why
  the breakage is possible.
- Separate a verified cause from an **Inference** or hypothesis, and cite each
  claim.
- Explain why the relevant code or safeguard exists in relation to the failure,
  rather than merely describing its mechanics.
- List the specific missing evidence needed to confirm any unverified cause.
- Do not call a change the root cause unless an issue, PR, commit, or other
  supplied record explicitly supports that conclusion.`;
