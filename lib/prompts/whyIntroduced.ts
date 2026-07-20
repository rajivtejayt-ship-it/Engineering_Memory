/** Instructions for investigating why a repository element was introduced. */
export const WHY_INTRODUCED_PROMPT = `## Analysis Focus: Why Introduced

- Identify the original problem, requirement, incident, or architectural
  decision that justified introducing the code.
- Start with the earliest relevant commit, issue, or merged pull request and
  trace only the evidence needed to establish the decision.
- Explain the trade-off the introduction made, if documented or reasonably
  inferred from cited evidence.
- Do not substitute a description of current behavior for historical intent.
- If no source records the original motivation, state that it is unknown and
  provide only a clearly labelled inference.
- Do not claim that the code was necessary unless evidence identifies the
  problem it was intended to solve.`;
