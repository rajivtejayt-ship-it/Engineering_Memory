import type {
  RepositoryCommit,
  RepositoryIssue,
  RepositoryPullRequest,
  RetrievalResult,
} from "@/lib/retriever";
import type { TimelineEvent, TimelineEventAnnotation } from "@/lib/types";

/** Repository records accepted by the deterministic timeline generator. */
export interface EngineeringTimelineInput {
  /** Relevant commits, in any order. */
  commits: RepositoryCommit[];
  /** Relevant pull requests, in any order. */
  pullRequests: RepositoryPullRequest[];
  /** Relevant issues, in any order. */
  issues: RepositoryIssue[];
}

type TimelineStage =
  | "problem"
  | "discussion"
  | "pull-request"
  | "merge"
  | "later-change";

interface StagedTimelineEvent extends TimelineEvent {
  stage: TimelineStage;
}

const STAGE_ORDER: Record<TimelineStage, number> = {
  problem: 0,
  discussion: 1,
  "pull-request": 2,
  merge: 3,
  "later-change": 4,
};

/**
 * Reconstructs a repository-backed engineering timeline without model calls.
 * Events are emitted only for supplied records and cite their source IDs.
 */
export function generateEngineeringTimeline(
  input: EngineeringTimelineInput,
): TimelineEvent[] {
  const events = [
    ...createIssueEvents(input.issues),
    ...createPullRequestEvents(input.pullRequests),
    ...createCommitEvents(input.commits, input.pullRequests),
  ];

  return events
    .sort(
      (left, right) =>
        getTimestamp(left.occurredAt) - getTimestamp(right.occurredAt) ||
        STAGE_ORDER[left.stage] - STAGE_ORDER[right.stage] ||
        left.id.localeCompare(right.id),
    )
    .map(toTimelineEvent);
}

/** Creates a timeline directly from ranked retrieval output. */
export function generateTimelineFromRetrieval(
  retrievalResult: RetrievalResult,
): TimelineEvent[] {
  return generateEngineeringTimeline({
    commits: retrievalResult.commits.map((item) => item.item),
    pullRequests: retrievalResult.pullRequests.map((item) => item.item),
    issues: retrievalResult.issues.map((item) => item.item),
  });
}

function createIssueEvents(issues: RepositoryIssue[]): StagedTimelineEvent[] {
  return issues.flatMap((issue) => {
    const sourceId = `issue:${issue.number}`;
    const occurredAt = issue.createdAt;
    const problemEvent: StagedTimelineEvent = {
      id: `timeline:problem:${issue.number}`,
      occurredAt,
      summary: `Problem discovered in issue #${issue.number}: ${issue.title} [${sourceId}]`,
      evidenceIds: [sourceId],
      annotations: ["problem-discovered", ...detectChangeAnnotations(issue.title, issue.summary)],
      stage: "problem",
    };

    if (!issue.summary.trim()) {
      return [problemEvent];
    }

    return [
      problemEvent,
      {
        id: `timeline:discussion:${issue.number}`,
        occurredAt,
        summary: `Discussion recorded for issue #${issue.number}: ${issue.summary} [${sourceId}]`,
        evidenceIds: [sourceId],
        annotations: ["discussion", ...detectChangeAnnotations(issue.title, issue.summary)],
        stage: "discussion",
      },
    ];
  });
}

function createPullRequestEvents(
  pullRequests: RepositoryPullRequest[],
): StagedTimelineEvent[] {
  return pullRequests.flatMap((pullRequest) => {
    const sourceId = `pull-request:${pullRequest.number}`;
    const events: StagedTimelineEvent[] = [];

    if (pullRequest.createdAt) {
      events.push({
        id: `timeline:pull-request:${pullRequest.number}`,
        occurredAt: pullRequest.createdAt,
        summary: `Pull request #${pullRequest.number} opened: ${pullRequest.title} [${sourceId}]`,
        evidenceIds: [sourceId],
        annotations: [
          "pull-request-opened",
          ...detectChangeAnnotations(pullRequest.title, pullRequest.summary),
        ],
        stage: "pull-request",
      });
    }
    if (pullRequest.status === "merged" && pullRequest.mergedAt) {
      events.push({
        id: `timeline:merge:${pullRequest.number}`,
        occurredAt: pullRequest.mergedAt,
        summary: `Code merged through pull request #${pullRequest.number}: ${pullRequest.title} [${sourceId}]`,
        evidenceIds: [sourceId],
        annotations: [
          "code-merged",
          ...detectChangeAnnotations(pullRequest.title, pullRequest.summary),
        ],
        stage: "merge",
      });
    }

    return events;
  });
}

function createCommitEvents(
  commits: RepositoryCommit[],
  pullRequests: RepositoryPullRequest[],
): StagedTimelineEvent[] {
  const firstMergeAt = Math.min(
    ...pullRequests
      .filter((pullRequest) => pullRequest.status === "merged" && pullRequest.mergedAt)
      .map((pullRequest) => getTimestamp(pullRequest.mergedAt)),
  );
  const hasMerge = Number.isFinite(firstMergeAt);

  return commits.map((commit) => {
    const sourceId = `commit:${commit.id}`;
    const isLaterChange = hasMerge && getTimestamp(commit.authoredAt) > firstMergeAt;
    const isRefactor = /\b(refactor|cleanup|migrate|moderni[sz]e|simplify|reorganize)\b/i.test(
      commit.message,
    );
    const eventLabel =
      isLaterChange && isRefactor
        ? "Later refactor"
        : isLaterChange
          ? "Later code change"
          : "Code change recorded";

    return {
      id: `timeline:commit:${commit.id}`,
      occurredAt: commit.authoredAt,
      summary: `${eventLabel}: ${commit.message} [${sourceId}]`,
      evidenceIds: [sourceId],
      annotations: [
        isLaterChange ? "later-change" : "code-change",
        ...detectChangeAnnotations(commit.message),
      ],
      stage: isLaterChange ? "later-change" : "merge",
    };
  });
}

function getTimestamp(occurredAt: string | undefined): number {
  const timestamp = occurredAt ? Date.parse(occurredAt) : Number.NaN;
  return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER;
}

/** Removes internal ordering metadata before a timeline is returned publicly. */
function toTimelineEvent(event: StagedTimelineEvent): TimelineEvent {
  return {
    id: event.id,
    occurredAt: event.occurredAt,
    summary: event.summary,
    evidenceIds: event.evidenceIds,
    annotations: event.annotations,
  };
}

/** Detects supported change categories from repository-authored source text. */
function detectChangeAnnotations(...values: string[]): TimelineEventAnnotation[] {
  const text = values.join(" ").toLowerCase();
  const annotations: TimelineEventAnnotation[] = [];

  if (/\b(revert|rollback|roll back|undo)\b/.test(text)) {
    annotations.push("reversion");
  }
  if (/\b(fix|bug|error|regression|resolve|patch)\b/.test(text)) {
    annotations.push("bug-fix");
  }
  if (/\b(refactor|cleanup|reorganize|simplify|restructure)\b/.test(text)) {
    annotations.push("refactor");
  }
  if (/\b(performance|perf|latency|throughput|optimi[sz]e|faster|cache)\b/.test(text)) {
    annotations.push("performance-improvement");
  }
  if (/\b(add|introduce|create|implement|enable|support|feature)\b/.test(text)) {
    annotations.push("feature-introduction");
  }

  return annotations;
}
