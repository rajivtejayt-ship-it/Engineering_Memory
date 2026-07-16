/** Structured content extracted from a Gemini Markdown response. */
export interface FormattedResponse {
  /** Concise answer to the user's question. */
  summary: string;
  /** Supporting source references or observations. */
  evidence: string[];
  /** Ordered events relevant to the answer. */
  timeline: string[];
  /** Known risks, uncertainty, or possible side effects. */
  risks: string[];
  /** Gemini's stated confidence and any accompanying rationale. */
  confidence: string;
}

type MarkdownSections = Record<string, string>;

/** Splits a Markdown document into sections keyed by lower-case heading text. */
export function parseMarkdownSections(markdown: string): MarkdownSections {
  const sections: MarkdownSections = {};
  let currentHeading: string | undefined;

  for (const line of markdown.split("\n")) {
    const heading = line.match(/^#{1,6}\s+(.+?)\s*$/);

    if (heading) {
      currentHeading = heading[1].toLowerCase();
      sections[currentHeading] ??= "";
      continue;
    }

    if (currentHeading) {
      sections[currentHeading] += `${sections[currentHeading] ? "\n" : ""}${line}`;
    }
  }

  return sections;
}

/** Converts a Markdown list section into cleaned list entries. */
export function parseMarkdownList(section: string | undefined): string[] {
  if (!section) {
    return [];
  }

  return section
    .split("\n")
    .map((line) => line.replace(/^\s*(?:[-*+]|\d+\.)\s+/, "").trim())
    .filter(Boolean);
}

/** Converts a Markdown section into compact plain text. */
export function parseMarkdownText(section: string | undefined): string {
  return section?.trim() ?? "";
}

/**
 * Formats Gemini's structured Markdown output into a stable response shape.
 * Missing list sections become empty arrays; missing text sections become empty strings.
 */
export function formatGeminiResponse(rawOutput: string): FormattedResponse {
  const sections = parseMarkdownSections(rawOutput);

  return {
    summary: parseMarkdownText(sections.summary),
    evidence: parseMarkdownList(sections.evidence),
    timeline: parseMarkdownList(sections.timeline),
    risks: parseMarkdownList(sections.risks),
    confidence: parseMarkdownText(sections.confidence),
  };
}
