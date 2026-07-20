import type {
  RepositoryCommit,
  RepositoryIssue,
  RepositoryPullRequest,
} from "@/lib/retriever";
import type { TimelineEvent } from "@/lib/types";

/** A discussion record normalized from an issue, pull request, or review thread. */
export interface RepositoryDiscussion {
  /** Provider-stable discussion or comment identifier. */
  id: string;
  /** Discussion text supplied by the repository provider. */
  body: string;
  /** ISO 8601 creation timestamp, when available. */
  createdAt?: string;
  /** Discussion author, when available. */
  author?: string;
  /** Related issue number, when applicable. */
  issueNumber?: number;
  /** Related pull-request number, when applicable. */
  pullRequestNumber?: number;
}

/** A source-cited conclusion in a reconstructed engineering decision. */
export interface DecisionFinding {
  /** Historical conclusion, quoted or conservatively summarized from evidence. */
  summary: string;
  /** Whether the conclusion is directly recorded, inferred, or unavailable. */
  certainty: "confirmed" | "inferred" | "unknown";
  /** Repository source IDs that support the conclusion. */
  evidenceIds: string[];
}

/** A chronological, source-backed account of an engineering decision. */
export interface DecisionReconstruction {
  /** The repository records considered while reconstructing the decision. */
  evidenceCount: number;
  /** The problem that motivated the feature or decision. */
  originalProblem: DecisionFinding;
  /** Explicit alternatives or rejected options found in the supplied history. */
  alternativesConsidered: DecisionFinding[];
  /** The implementation or architectural choice recorded in history. */
  chosenSolution: DecisionFinding;
  /** Documented costs, constraints, or risks of the selected solution. */
  tradeoffs: DecisionFinding[];
  /** Later changes or current historical signal after the initial decision. */
  longTermImpact: DecisionFinding;
  /** Supplied events ordered into the engineering story. */
  timeline: TimelineEvent[];
}

/** Inputs used to reconstruct a feature's engineering decision history. */
export interface DecisionReconstructionInput {
  /** Relevant commits, in any order. */
  commits?: RepositoryCommit[];
  /** Relevant issues, in any order. */
  issues?: RepositoryIssue[];
  /** Relevant pull requests, in any order. */
  pullRequests?: RepositoryPullRequest[];
  /** Relevant issue, PR, or review discussions, in any order. */
  discussions?: RepositoryDiscussion[];
  /** Existing source-backed timeline events, in any order. */
  timeline?: TimelineEvent[];
}

interface HistoricalRecord {
  id: string;
  text: string;
  occurredAt?: string;
  kind: "commit" | "issue" | "pull-request" | "discussion" | "timeline";
  merged?: boolean;
}

const PROBLEM_PATTERN = /\b(problem|bug|failure|regression|incident|unable|missing|need(?:ed)?|require(?:d|ment)?|prevent|fix)\b/i;
const ALTERNATIVE_PATTERN = /\b(alternative|option|instead|rather than|versus|\bvs\.?\b|consider(?:ed|ing)?|reject(?:ed|ing)?|avoid)\b/i;
const TRADEOFF_PATTERN = /\b(trade[ -]?off|cost|risk|compatib(?:ility|le)|migration|complex(?:ity)?|performance|latency|security|maintenance)\b/i;
const SOLUTION_PATTERN = /\b(add(?:ed)?|introduc(?:e|ed|ing)|implement(?:ed|ing)?|create(?:d|ing)?|adopt(?:ed|ing)?|merge(?:d|ing)?)\b/i;
const LATER_CHANGE_PATTERN = /\b(refactor|migrat(?:e|ed|ing)|deprecat(?:e|ed|ing)|remove(?:d|ing)?|revert(?:ed|ing)?|fix(?:ed|ing)?|improv(?:e|ed|ing))\b/i;

/**
 * Reconstructs a decision solely from supplied repository history. It never
 * calls an LLM and reports unavailable history instead of inventing rationale.
 */
export function reconstructEngineeringDecision(
  input: DecisionReconstructionInput,
): DecisionReconstruction {
  const records = collectRecords(input);
  const chronologicalRecords = sortChronologically(records);
  const timeline = [...(input.timeline ?? [])].sort(compareTimelineEvents);

  const problem = findProblem(chronologicalRecords);
  const alternatives = chronologicalRecords
    .filter((record) => ALTERNATIVE_PATTERN.test(record.text))
    .slice(0, 3)
    .map((record) => toFinding(record, "confirmed", "Alternative considered"));
  const solution = findSolution(chronologicalRecords);
  const tradeoffs = chronologicalRecords
    .filter((record) => TRADEOFF_PATTERN.test(record.text))
    .slice(0, 3)
    .map((record) => toFinding(record, "confirmed", "Trade-off or constraint recorded"));
  const longTermImpact = findLongTermImpact(chronologicalRecords, solution);

  return {
    evidenceCount: records.length,
    originalProblem: problem,
    alternativesConsidered: alternatives,
    chosenSolution: solution,
    tradeoffs,
    longTermImpact,
    timeline,
  };
}

function collectRecords(input: DecisionReconstructionInput): HistoricalRecord[] {
  return [
    ...(input.issues ?? []).map((issue) => ({
      id: `issue:${issue.number}`,
      text: [issue.title, issue.summary, ...issue.labels].filter(Boolean).join(". "),
      occurredAt: issue.createdAt,
      kind: "issue" as const,
    })),
    ...(input.pullRequests ?? []).map((pullRequest) => ({
      id: `pull-request:${pullRequest.number}`,
      text: [pullRequest.title, pullRequest.summary].filter(Boolean).join(". "),
      occurredAt: pullRequest.mergedAt ?? pullRequest.createdAt,
      kind: "pull-request" as const,
      merged: pullRequest.status === "merged",
    })),
    ...(input.commits ?? []).map((commit) => ({
      id: `commit:${commit.id}`,
      text: commit.message,
      occurredAt: commit.authoredAt,
      kind: "commit" as const,
    })),
    ...(input.discussions ?? []).map((discussion) => ({
      id: `discussion:${discussion.id}`,
      text: discussion.body,
      occurredAt: discussion.createdAt,
      kind: "discussion" as const,
    })),
    ...(input.timeline ?? []).map((event) => ({
      id: event.id,
      text: event.summary,
      occurredAt: event.occurredAt,
      kind: "timeline" as const,
    })),
  ].filter((record) => record.text.trim().length > 0);
}

function findProblem(records: HistoricalRecord[]): DecisionFinding {
  const directProblem = records.find(
    (record) => record.kind === "issue" && PROBLEM_PATTERN.test(record.text),
  ) ?? records.find((record) => PROBLEM_PATTERN.test(record.text));

  if (directProblem) {
    return toFinding(directProblem, "confirmed", "Original problem recorded");
  }

  return unknownFinding("The original problem is not documented in the supplied history.");
}

function findSolution(records: HistoricalRecord[]): DecisionFinding {
  const directSolution = records.find(
    (record) => record.kind === "pull-request" && record.merged && SOLUTION_PATTERN.test(record.text),
  ) ?? records.find((record) => record.kind === "commit" && SOLUTION_PATTERN.test(record.text))
    ?? records.find((record) => record.kind === "pull-request" && record.merged);

  if (directSolution) {
    return toFinding(directSolution, "confirmed", "Chosen solution recorded");
  }

  return unknownFinding("The chosen solution is not documented in the supplied history.");
}

function findLongTermImpact(
  records: HistoricalRecord[],
  solution: DecisionFinding,
): DecisionFinding {
  const solutionId = solution.evidenceIds[0];
  const solutionIndex = solutionId
    ? records.findIndex((record) => record.id === solutionId)
    : -1;
  const laterRecords = solutionIndex >= 0 ? records.slice(solutionIndex + 1) : records;
  const impact = [...laterRecords]
    .reverse()
    .find((record) => LATER_CHANGE_PATTERN.test(record.text));

  if (impact) {
    return toFinding(impact, "confirmed", "Later historical impact recorded");
  }
  if (solutionId) {
    return {
      summary: "No later refactor, regression, removal, or follow-up impact is recorded in the supplied history.",
      certainty: "unknown",
      evidenceIds: [solutionId],
    };
  }

  return unknownFinding("Long-term impact is not documented in the supplied history.");
}

function toFinding(
  record: HistoricalRecord,
  certainty: DecisionFinding["certainty"],
  label: string,
): DecisionFinding {
  return {
    summary: `${label}: ${compactText(record.text)}`,
    certainty,
    evidenceIds: [record.id],
  };
}

function unknownFinding(summary: string): DecisionFinding {
  return { summary, certainty: "unknown", evidenceIds: [] };
}

function sortChronologically(records: HistoricalRecord[]): HistoricalRecord[] {
  return [...records].sort(
    (left, right) => getTimestamp(left.occurredAt) - getTimestamp(right.occurredAt) || left.id.localeCompare(right.id),
  );
}

function compareTimelineEvents(left: TimelineEvent, right: TimelineEvent): number {
  return getTimestamp(left.occurredAt) - getTimestamp(right.occurredAt) || left.id.localeCompare(right.id);
}

function getTimestamp(value: string | undefined): number {
  const timestamp = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER;
}

function compactText(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length <= 280 ? normalized : `${normalized.slice(0, 279)}…`;
}
