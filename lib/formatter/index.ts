import type { AIResponse } from "@/lib/types";

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
  /** Follow-up questions suggested by Gemini. */
  suggestedNextQuestions: string[];
}

type MarkdownSections = Record<string, string>;

const SECTION_ALIASES: Record<string, string> = {
  answer: "summary",
  summary: "summary",
  timeline: "timeline",
  evidence: "evidence",
  risks: "risks",
  risk: "risks",
  confidence: "confidence",
  "suggested next questions": "suggested next questions",
  "next questions": "suggested next questions",
  "suggested questions": "suggested next questions",
};

/** Normalizes a section heading and maps common aliases to the expected key. */
function normalizeHeading(heading: string): string {
  const normalizedHeading = heading
    .replace(/^\*\*|\*\*$/g, "")
    .replace(/:$/, "")
    .trim()
    .toLowerCase();

  return SECTION_ALIASES[normalizedHeading] ?? normalizedHeading;
}

/** Identifies Markdown, bold, or plain-text section headings. */
function getHeading(line: string): string | undefined {
  const markdownHeading = line.match(/^#{1,6}\s+(.+?)\s*$/);

  if (markdownHeading) {
    return normalizeHeading(markdownHeading[1]);
  }

  const boldHeading = line.match(/^\*\*(.+?)\*\*:?[\t ]*$/);

  if (boldHeading) {
    return normalizeHeading(boldHeading[1]);
  }

  const plainHeading = line.match(/^([A-Za-z ]+):\s*$/);

  return plainHeading ? normalizeHeading(plainHeading[1]) : undefined;
}

/** Splits well-formed or lightly malformed Markdown into named response sections. */
export function parseMarkdownSections(markdown: string): MarkdownSections {
  const sections: MarkdownSections = {};
  let currentHeading: string | undefined;

  for (const line of markdown.split("\n")) {
    const heading = getHeading(line);

    if (heading) {
      currentHeading = heading;
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
 * Missing list sections become empty arrays. Plain or malformed responses are
 * preserved as the summary instead of causing a parsing failure.
 */
export function formatGeminiResponse(rawOutput: string): FormattedResponse {
  const sections = parseMarkdownSections(rawOutput);
  const fallbackSummary = rawOutput.trim() || "Gemini returned an empty response.";

  return {
    summary: parseMarkdownText(sections.summary) || fallbackSummary,
    evidence: parseMarkdownList(sections.evidence),
    timeline: parseMarkdownList(sections.timeline),
    risks: parseMarkdownList(sections.risks),
    confidence: parseMarkdownText(sections.confidence),
    suggestedNextQuestions: parseMarkdownList(
      sections["suggested next questions"],
    ),
  };
}

/** Converts structured formatted content into the public AI response model. */
export function createAIResponse(formatted: FormattedResponse): AIResponse {
  const evidence = formatted.evidence.map((content, index) => ({
    id: `evidence-${index + 1}`,
    source: "Gemini response",
    content,
  }));

  const timeline = formatted.timeline.map((summary, index) => ({
    id: `timeline-${index + 1}`,
    summary,
  }));

  return {
    summary: formatted.summary,
    answer: formatted.summary,
    evidence,
    timeline,
    risks: formatted.risks,
    confidence: formatted.confidence,
    suggestedNextQuestions: formatted.suggestedNextQuestions,
  };
}

/** Formats raw Gemini Markdown directly into the public AI response model. */
export function formatAIResponse(rawOutput: string): AIResponse {
  return createAIResponse(formatGeminiResponse(rawOutput));
}
