/** Instructions for assessing the relevance of repository code or history. */
export const RELEVANCE_PROMPT = `## Analysis Focus: Relevance

- Explain the historical decision or dependency that makes the code relevant,
  using evidence of consumers, incidents, or architectural intent.
- Establish direct evidence before discussing indirect impact or removal risk.
- Distinguish current confirmed relevance from historical relevance that may no
  longer apply.
- Do not claim that code is unused, safe to remove, or required unless the
  supplied evidence supports that conclusion.
- State the uncertainty and the next repository evidence needed when relevance
  cannot be established.
- Explain the maintenance or removal risk as documented evidence, an inference,
  or an unknown; never present a hypothetical risk as confirmed.`;
