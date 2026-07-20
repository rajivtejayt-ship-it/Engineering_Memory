/** A question submitted to the Engineering Memory system. */
export interface Question {
  /** Stable identifier for this question. */
  id: string;
  /** Natural-language question to answer. */
  text: string;
  /** Repository information used when interpreting the question. */
  repositoryContext?: RepositoryContext;
}

/** The repository state relevant to a question or response. */
export interface RepositoryContext {
  /** Repository name or canonical repository identifier. */
  repository: string;
  /** Branch, tag, or commit used as the repository reference. */
  ref?: string;
  /** File path most relevant to the current question, when provided. */
  filePath?: string;
}

/** A source item that supports a response or timeline event. */
export interface Evidence {
  /** Stable identifier for this evidence item. */
  id: string;
  /** Human- or machine-readable description of where the evidence came from. */
  source: string;
  /** Relevant extracted content from the source. */
  content: string;
  /** Optional location within the source, such as a file path or URL fragment. */
  location?: string;
}

/** A dated event discovered in repository history or supporting evidence. */
export interface TimelineEvent {
  /** Stable identifier for this event. */
  id: string;
  /** ISO 8601 timestamp for when the event occurred, when it is known. */
  occurredAt?: string;
  /** Concise description of what happened. */
  summary: string;
  /** Identifiers of evidence items that support this event. */
  evidenceIds?: string[];
}

/** The generated answer and its supporting references. */
export interface AIResponse {
  /** Concise summary produced for a question. */
  summary: string;
  /** Backwards-compatible alias of the generated summary. */
  answer: string;
  /** Evidence extracted from the generated response. */
  evidence?: Evidence[];
  /** Relevant events included in the answer's reasoning. */
  timeline?: TimelineEvent[];
  /** Potential risks, assumptions, or side effects identified in the response. */
  risks?: string[];
  /** Stated confidence and any accompanying rationale. */
  confidence?: string;
  /** Follow-up questions suggested by the generated response. */
  suggestedNextQuestions?: string[];
}
