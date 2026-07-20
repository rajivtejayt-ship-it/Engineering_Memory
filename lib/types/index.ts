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
  /** Repository source IDs explicitly cited by this evidence claim. */
  sourceIds?: string[];
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
  /** Deterministic lifecycle and change classifications for this event. */
  annotations?: TimelineEventAnnotation[];
}

/** Classifications used to describe an event in the engineering timeline. */
export type TimelineEventAnnotation =
  | "problem-discovered"
  | "discussion"
  | "pull-request-opened"
  | "code-merged"
  | "code-change"
  | "later-change"
  | "feature-introduction"
  | "bug-fix"
  | "reversion"
  | "refactor"
  | "performance-improvement";

/** A repository record available for frontend evidence attribution. */
export interface SourceAttribution {
  /** Stable source ID used by AI citations, such as `commit:abc123`. */
  id: string;
  /** Repository source category. */
  type: "commit" | "pull-request" | "issue";
  /** Commit identifier when this source represents a commit. */
  commitId?: string;
  /** Pull request number when this source represents a pull request. */
  pullRequestNumber?: number;
  /** Issue number when this source represents an issue. */
  issueNumber?: number;
  /** Human-readable source title or subject. */
  summary: string;
  /** Optional repository location relevant to the source. */
  location?: string;
}

/** Debug metadata describing how an Engineering Memory response was produced. */
export interface ExplainabilityMetadata {
  /** Number of ranked repository records selected for the response. */
  retrievedEvidenceCount: number;
  /** Deterministic evidence-confidence score on a 0–100 scale. */
  confidence: number;
  /** Time spent retrieving evidence, in milliseconds. */
  retrievalTimeMs: number;
  /** Time spent building, generating, and formatting the answer, in milliseconds. */
  reasoningTimeMs: number;
  /** Character length of the final prompt sent to the model. */
  promptSize: number;
}

/** Deterministic confidence assessment accompanying an AI response. */
export interface ConfidenceAssessment {
  /** Evidence-confidence score on a 0–100 scale. */
  score: number;
  /** Calibrated level derived from the numeric score. */
  level: "LOW" | "MEDIUM" | "HIGH";
  /** Evidence-backed explanation of supporting and limiting signals. */
  explanation: string;
}

/** A breakdown of repository records used to construct an answer. */
export interface EvidenceUsed {
  /** Total number of ranked evidence records used by the answer. */
  total: number;
  /** Commit identifiers included in the retrieved evidence. */
  commitIds: string[];
  /** Pull-request numbers included in the retrieved evidence. */
  pullRequestNumbers: number[];
  /** Issue numbers included in the retrieved evidence. */
  issueNumbers: number[];
  /** Documentation paths included in the retrieved evidence. */
  documentationPaths: string[];
}

/** Deterministic assessment of how well the available evidence supports reasoning. */
export interface ReasoningQuality {
  /** Evidence-based reasoning quality level. */
  level: "LOW" | "MEDIUM" | "HIGH";
  /** Concise explanation of the evidence coverage behind the level. */
  explanation: string;
}

/** Frontend-ready explanation of how an Engineering Memory answer was produced. */
export interface ExplainabilityInfo {
  /** Repository records used as answer evidence. */
  evidenceUsed: EvidenceUsed;
  /** Number of deterministic timeline events included in the answer. */
  timelineLength: number;
  /** Character length of the final prompt sent to the model. */
  promptSize: number;
  /** Time spent retrieving and ranking evidence, in milliseconds. */
  retrievalTimeMs: number;
  /** Time spent building, generating, and formatting the answer, in milliseconds. */
  reasoningTimeMs: number;
  /** Deterministic 0–100 evidence-confidence assessment. */
  confidence: ConfidenceAssessment;
  /** Assessment of the evidence quality supporting the generated reasoning. */
  reasoningQuality: ReasoningQuality;
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
  /** Deterministic evidence-confidence assessment. */
  confidence?: ConfidenceAssessment;
  /** Source records the frontend can resolve from cited source IDs. */
  sources?: SourceAttribution[];
  /** Debug metadata for retrieval, reasoning, and prompt construction. */
  metadata: ExplainabilityMetadata;
  /** Frontend-ready details of the evidence and reasoning behind this answer. */
  explainability: ExplainabilityInfo;
  /** Follow-up questions suggested by the generated response. */
  suggestedNextQuestions?: string[];
}
