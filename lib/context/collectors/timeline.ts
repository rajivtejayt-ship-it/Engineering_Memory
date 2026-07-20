import type { TimelineEvent } from "@/types/context";
import type {
  CommitSummary,
  IssueSummary,
  PullRequestSummary,
} from "@/types/github";

export interface TimelineCollectorInput {
  commits: readonly CommitSummary[];
  pullRequests: readonly PullRequestSummary[];
  issues: readonly IssueSummary[];
}

interface IdentifiedTimelineEvent {
  id: string;
  event: TimelineEvent;
}

/** Aggregates already collected repository history into a newest-first timeline. */
export function collectTimeline(
  input: TimelineCollectorInput,
): readonly TimelineEvent[] {
  const identifiedEvents = [
    ...input.commits.flatMap(toCommitTimelineEvent),
    ...input.pullRequests.flatMap(toPullRequestTimelineEvent),
    ...input.issues.flatMap(toIssueTimelineEvent),
  ];
  const seenIds = new Set<string>();

  return identifiedEvents
    .filter(({ id }) => {
      if (seenIds.has(id)) {
        return false;
      }

      seenIds.add(id);
      return true;
    })
    .map(({ event }) => event)
    .sort(
      (left, right) =>
        Date.parse(right.occurredAt) - Date.parse(left.occurredAt),
    );
}

function toCommitTimelineEvent(
  commit: CommitSummary,
): IdentifiedTimelineEvent[] {
  if (
    !isNonEmptyString(commit.sha) ||
    !isNonEmptyString(commit.message) ||
    !isValidTimestamp(commit.authoredAt) ||
    !isNonEmptyString(commit.url)
  ) {
    return [];
  }

  return [
    {
      id: `COMMIT:${commit.sha}`,
      event: {
        occurredAt: commit.authoredAt,
        type: "COMMIT",
        title: commit.message,
        url: commit.url,
      },
    },
  ];
}

function toPullRequestTimelineEvent(
  pullRequest: PullRequestSummary,
): IdentifiedTimelineEvent[] {
  if (
    !Number.isSafeInteger(pullRequest.number) ||
    !isNonEmptyString(pullRequest.title) ||
    !isValidTimestamp(pullRequest.createdAt) ||
    !isNonEmptyString(pullRequest.url)
  ) {
    return [];
  }

  return [
    {
      id: `PULL_REQUEST:${pullRequest.number}`,
      event: {
        occurredAt: pullRequest.createdAt,
        type: "PULL_REQUEST",
        title: pullRequest.title,
        url: pullRequest.url,
      },
    },
  ];
}

function toIssueTimelineEvent(issue: IssueSummary): IdentifiedTimelineEvent[] {
  if (
    !Number.isSafeInteger(issue.number) ||
    !isNonEmptyString(issue.title) ||
    !isValidTimestamp(issue.createdAt) ||
    !isNonEmptyString(issue.url)
  ) {
    return [];
  }

  return [
    {
      id: `ISSUE:${issue.number}`,
      event: {
        occurredAt: issue.createdAt,
        type: "ISSUE",
        title: issue.title,
        url: issue.url,
      },
    },
  ];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidTimestamp(value: unknown): value is string {
  return isNonEmptyString(value) && !Number.isNaN(Date.parse(value));
}
