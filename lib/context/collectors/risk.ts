import type { RiskArea, TimelineEvent } from "@/types/context";
import type {
  CommitSummary,
  IssueSummary,
  PullRequestSummary,
} from "@/types/github";

const LONG_LIVED_DAYS = 30;
const HIGH_ACTIVITY_WINDOW_DAYS = 30;
const HIGH_ACTIVITY_EVENT_COUNT = 10;
const REPEATED_FILE_CHANGE_COUNT = 2;

export interface RiskCollectorInput {
  commits: readonly CommitSummary[];
  pullRequests: readonly PullRequestSummary[];
  issues: readonly IssueSummary[];
  timeline: readonly TimelineEvent[];
}

/** Derives explainable maintenance risks from already collected repository evidence. */
export function collectRiskAreas(
  input: RiskCollectorInput,
): readonly RiskArea[] {
  const now = Date.now();
  const pullRequests = Array.isArray(input.pullRequests)
    ? input.pullRequests
    : [];
  const issues = Array.isArray(input.issues) ? input.issues : [];
  const timeline = Array.isArray(input.timeline) ? input.timeline : [];

  return [
    ...collectRepeatedFileRisks(input.commits),
    ...collectLongLivedPullRequestRisks(pullRequests, now),
    ...collectStaleIssueRisks(issues, now),
    ...collectHighActivityRisk(pullRequests, issues, timeline, now),
  ];
}

function collectRepeatedFileRisks(
  commits: readonly CommitSummary[],
): RiskArea[] {
  if (!Array.isArray(commits)) {
    return [];
  }

  const fileChanges = new Map<string, number>();

  for (const commit of commits) {
    if (!isRecord(commit) || !Array.isArray(commit.files)) {
      continue;
    }

    const pathsInCommit = new Set<string>();
    for (const file of commit.files) {
      if (isRecord(file) && isNonEmptyString(file.path)) {
        pathsInCommit.add(file.path);
      }
    }

    for (const path of pathsInCommit) {
      fileChanges.set(path, (fileChanges.get(path) ?? 0) + 1);
    }
  }

  return [...fileChanges]
    .filter(([, changeCount]) => changeCount >= REPEATED_FILE_CHANGE_COUNT)
    .map(([path, changeCount]) => ({
      path,
      reason: `Changed in ${changeCount} recently collected commits.`,
      relatedPullRequestNumbers: [],
      relatedIssueNumbers: [],
    }));
}

function collectLongLivedPullRequestRisks(
  pullRequests: readonly PullRequestSummary[],
  now: number,
): RiskArea[] {
  const seenNumbers = new Set<number>();

  return pullRequests.flatMap((pullRequest) => {
    if (
      !isRecord(pullRequest) ||
      pullRequest.state !== "OPEN" ||
      !isPositiveInteger(pullRequest.number) ||
      seenNumbers.has(pullRequest.number)
    ) {
      return [];
    }

    const ageInDays = getAgeInDays(pullRequest.createdAt, now);
    if (ageInDays === null || ageInDays < LONG_LIVED_DAYS) {
      return [];
    }

    seenNumbers.add(pullRequest.number);
    return [
      {
        path: "repository",
        reason: `Pull request #${pullRequest.number} has remained open for ${ageInDays} days.`,
        relatedPullRequestNumbers: [pullRequest.number],
        relatedIssueNumbers: [],
      },
    ];
  });
}

function collectStaleIssueRisks(
  issues: readonly IssueSummary[],
  now: number,
): RiskArea[] {
  const seenNumbers = new Set<number>();

  return issues.flatMap((issue) => {
    if (
      !isRecord(issue) ||
      issue.state !== "OPEN" ||
      !isPositiveInteger(issue.number) ||
      seenNumbers.has(issue.number)
    ) {
      return [];
    }

    const ageInDays = getAgeInDays(issue.createdAt, now);
    if (ageInDays === null || ageInDays < LONG_LIVED_DAYS) {
      return [];
    }

    seenNumbers.add(issue.number);
    return [
      {
        path: "repository",
        reason: `Issue #${issue.number} has remained open for ${ageInDays} days.`,
        relatedPullRequestNumbers: [],
        relatedIssueNumbers: [issue.number],
      },
    ];
  });
}

function collectHighActivityRisk(
  pullRequests: readonly PullRequestSummary[],
  issues: readonly IssueSummary[],
  timeline: readonly TimelineEvent[],
  now: number,
): RiskArea[] {
  const windowStart = now - HIGH_ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const recentEvents = timeline.filter((event) => {
    if (!isRecord(event)) {
      return false;
    }

    const timestamp = toTimestamp(event.occurredAt);
    return timestamp !== null && timestamp >= windowStart && timestamp <= now;
  });

  if (recentEvents.length < HIGH_ACTIVITY_EVENT_COUNT) {
    return [];
  }

  return [
    {
      path: "repository",
      reason: `${recentEvents.length} timeline events were recorded in the last ${HIGH_ACTIVITY_WINDOW_DAYS} days.`,
      relatedPullRequestNumbers: getRecentNumbers(
        pullRequests,
        "createdAt",
        windowStart,
        now,
      ),
      relatedIssueNumbers: getRecentNumbers(
        issues,
        "createdAt",
        windowStart,
        now,
      ),
    },
  ];
}

function getRecentNumbers(
  items: readonly PullRequestSummary[] | readonly IssueSummary[],
  dateKey: "createdAt",
  windowStart: number,
  now: number,
): number[] {
  const numbers = new Set<number>();

  for (const item of items) {
    if (!isRecord(item) || !isPositiveInteger(item.number)) {
      continue;
    }

    const timestamp = toTimestamp(item[dateKey]);
    if (timestamp !== null && timestamp >= windowStart && timestamp <= now) {
      numbers.add(item.number);
    }
  }

  return [...numbers];
}

function getAgeInDays(value: unknown, now: number): number | null {
  const timestamp = toTimestamp(value);
  if (timestamp === null || timestamp > now) {
    return null;
  }

  return Math.floor((now - timestamp) / (24 * 60 * 60 * 1000));
}

function toTimestamp(value: unknown): number | null {
  if (!isNonEmptyString(value)) {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}
