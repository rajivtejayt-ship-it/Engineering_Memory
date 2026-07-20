import type { ConfidenceLevel } from "@/lib/constants";
import type { RetrievalResult } from "@/lib/retriever";
import type { ConfidenceAssessment } from "@/lib/types";

/** Public score thresholds for evidence confidence on a 0–100 scale. */
export const EVIDENCE_CONFIDENCE_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 50,
  LOW: 0,
} as const;

const WEIGHTS = {
  agreeingCommits: 30,
  issue: 15,
  mergedPullRequest: 20,
  documentation: 15,
  evidenceStrength: 15,
} as const;

const PENALTIES = {
  weakEvidence: 15,
  sparseEvidence: 10,
  singleEvidenceItem: 20,
  noEvidence: 30,
  conflictingCommits: 15,
  missingDiscussions: 10,
  missingReference: 5,
  missingFilePath: 5,
} as const;

/**
 * Scores repository evidence on a 0–100 scale. The assessment is
 * deterministic, independent of Gemini, and includes an explanation suitable
 * for display or debugging.
 */
export function calculateEvidenceConfidence(
  result: RetrievalResult,
): ConfidenceAssessment {
  const evidence = [
    ...result.commits,
    ...result.pullRequests,
    ...result.issues,
    ...result.documentation,
  ];
  const averageRelevance =
    evidence.reduce((total, item) => total + item.score, 0) /
    Math.max(evidence.length, 1);
  const supportingSignals: string[] = [];
  const limitingSignals: string[] = [];
  let score = averageRelevance * WEIGHTS.evidenceStrength;

  const agreeingCommitCount = getAgreeingCommitCount(result);
  if (agreeingCommitCount >= 3) {
    score += WEIGHTS.agreeingCommits;
    supportingSignals.push(
      `${agreeingCommitCount} commits corroborate the same target or linked decision.`,
    );
  } else if (agreeingCommitCount >= 2) {
    score += WEIGHTS.agreeingCommits * (2 / 3);
    supportingSignals.push(
      `${agreeingCommitCount} commits corroborate the same target or linked decision.`,
    );
  }

  if (result.issues.length > 0) {
    score += WEIGHTS.issue;
    supportingSignals.push("Relevant issue evidence is available.");
  }
  if (result.pullRequests.some((item) => item.item.status === "merged")) {
    score += WEIGHTS.mergedPullRequest;
    supportingSignals.push("A relevant merged pull request is available.");
  }
  if (result.documentation.length > 0) {
    score += WEIGHTS.documentation;
    supportingSignals.push("Relevant documentation is available.");
  }

  if (evidence.length === 0) {
    score -= PENALTIES.noEvidence;
    limitingSignals.push("No repository evidence was retrieved.");
  } else if (evidence.length === 1) {
    score -= PENALTIES.singleEvidenceItem;
    limitingSignals.push("Only one evidence item was retrieved.");
  } else if (evidence.length <= 3) {
    score -= PENALTIES.sparseEvidence;
    limitingSignals.push("Repository history is sparse for this question.");
  }
  if (averageRelevance < 0.4) {
    score -= PENALTIES.weakEvidence;
    limitingSignals.push("Retrieved evidence has weak relevance scores.");
  }
  if (hasConflictingCommits(result)) {
    score -= PENALTIES.conflictingCommits;
    limitingSignals.push(
      "Commit history contains conflicting or reverted decision signals.",
    );
  }
  if (!hasRecordedDiscussion(result)) {
    score -= PENALTIES.missingDiscussions;
    limitingSignals.push("No issue discussion records were supplied.");
  }
  if (!result.repositoryContext.ref) {
    score -= PENALTIES.missingReference;
    limitingSignals.push("Repository reference is not specified.");
  }
  if (!result.repositoryContext.filePath) {
    score -= PENALTIES.missingFilePath;
    limitingSignals.push("Target file path is not specified.");
  }

  const roundedScore = Math.round(clamp(score, 0, 100));
  const level = getConfidenceLevel(roundedScore);

  return {
    score: roundedScore,
    level,
    explanation: createExplanation(level, supportingSignals, limitingSignals),
  };
}

/** Maps a numeric evidence-confidence score to its calibrated level. */
export function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= EVIDENCE_CONFIDENCE_THRESHOLDS.HIGH) {
    return "HIGH";
  }
  if (score >= EVIDENCE_CONFIDENCE_THRESHOLDS.MEDIUM) {
    return "MEDIUM";
  }

  return "LOW";
}

function createExplanation(
  level: ConfidenceLevel,
  supportingSignals: string[],
  limitingSignals: string[],
): string {
  const support =
    supportingSignals.length > 0
      ? supportingSignals.join(" ")
      : "No strong corroborating evidence was found.";
  const limitations =
    limitingSignals.length > 0
      ? limitingSignals.join(" ")
      : "No material evidence limitations were detected.";

  return `${level} confidence. Supporting evidence: ${support} Limitations: ${limitations}`;
}

/**
 * Counts commits that corroborate the same file or linked issue/PR. Unrelated
 * commits do not count as agreement merely because they were retrieved.
 */
function getAgreeingCommitCount(result: RetrievalResult): number {
  const targetFile = result.repositoryContext.filePath;
  const commitsForTargetFile = targetFile
    ? result.commits.filter((commit) => commit.item.files.includes(targetFile))
        .length
    : 0;
  if (commitsForTargetFile >= 2) {
    return commitsForTargetFile;
  }

  const relationshipCounts = new Map<string, number>();
  for (const commit of result.commits) {
    for (const issueNumber of commit.item.issueNumbers ?? []) {
      incrementCount(relationshipCounts, `issue:${issueNumber}`);
    }
    if (commit.item.pullRequestNumber !== undefined) {
      incrementCount(
        relationshipCounts,
        `pull-request:${commit.item.pullRequestNumber}`,
      );
    }
  }

  return Math.max(0, ...relationshipCounts.values());
}

/** Detects explicit reverts or opposing decision language in commit history. */
function hasConflictingCommits(result: RetrievalResult): boolean {
  const messages = result.commits.map((commit) => commit.item.message);
  const hasRevert = messages.some((message) =>
    /\b(revert|rollback|roll back|undo)\b/i.test(message),
  );
  const hasIntroduction = messages.some((message) =>
    /\b(add|introduce|enable|create)\b/i.test(message),
  );
  const hasRemoval = messages.some((message) =>
    /\b(remove|disable|deprecate|revert)\b/i.test(message),
  );

  return hasRevert || (hasIntroduction && hasRemoval);
}

/** Checks whether the normalized issue data includes a recorded discussion. */
function hasRecordedDiscussion(result: RetrievalResult): boolean {
  return result.issues.some((issue) => (issue.item.discussionCount ?? 0) > 0);
}

function incrementCount(counts: Map<string, number>, key: string): void {
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
