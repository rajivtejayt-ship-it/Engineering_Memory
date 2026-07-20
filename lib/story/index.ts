import type {
  RepositoryCommit,
  RepositoryEvidenceData,
  RepositoryIssue,
  RepositoryPullRequest,
  RetrievalResult,
} from "@/lib/retriever";
import type { RepositoryContext, TimelineEvent } from "@/lib/types";

/** Dashboard sections that form the repository's chronological story. */
export type RepositoryStoryPhase =
  | "project-birth"
  | "major-milestone"
  | "architectural-decision"
  | "critical-bug"
  | "major-refactor"
  | "current-state";

/** A source-linked event included in the dashboard repository story. */
export interface RepositoryStoryEvent extends TimelineEvent {
  /** One or more dashboard story sections represented by this event. */
  phases: RepositoryStoryPhase[];
}

/** Deterministic chronological story suitable for the repository dashboard. */
export interface RepositoryStory {
  /** Repository identity and reference used to generate the story. */
  repositoryContext: RepositoryContext;
  /** Chronological, source-linked repository story events. */
  events: RepositoryStoryEvent[];
}

interface StoryCandidate {
  id: string;
  occurredAt?: string;
  summary: string;
  sourceIds: string[];
  phases: RepositoryStoryPhase[];
}

const ARCHITECTURE_PATTERN =
  /\b(adr|architecture|architectural|decision|design|boundary|migration)\b/i;
const CRITICAL_BUG_PATTERN =
  /\b(critical|security|data loss|outage|incident|regression|failure|bug)\b/i;
const REFACTOR_PATTERN =
  /\b(refactor|cleanup|reorganize|restructure|simplify|moderni[sz]e|migrate)\b/i;

/**
 * Builds a chronological repository story from normalized backend evidence.
 * It performs no model calls and safely handles absent source collections.
 */
export function generateRepositoryStory(
  repositoryContext: RepositoryContext,
  repositoryData: RepositoryEvidenceData = {},
): RepositoryStory {
  const commits = repositoryData.commits ?? [];
  const pullRequests = repositoryData.pullRequests ?? [];
  const issues = repositoryData.issues ?? [];
  const documentation = repositoryData.documentation ?? [];
  const candidates = [
    ...createMilestoneCandidates(pullRequests),
    ...createArchitectureCandidates(pullRequests, documentation),
    ...createCriticalBugCandidates(issues),
    ...createRefactorCandidates(commits, pullRequests),
  ];
  const birthCandidate = createProjectBirthCandidate(
    commits,
    pullRequests,
    issues,
    documentation,
  );

  if (birthCandidate) {
    candidates.push(birthCandidate);
  }

  return {
    repositoryContext,
    events: [
      ...sortStoryCandidates(candidates).map(toStoryEvent),
      createCurrentStateCandidate(
        repositoryContext,
        candidates,
        commits.length + pullRequests.length + issues.length + documentation.length,
      ),
    ],
  };
}

/** Creates a story from evidence already selected by the Retriever. */
export function generateRepositoryStoryFromRetrieval(
  retrievalResult: RetrievalResult,
): RepositoryStory {
  return generateRepositoryStory(retrievalResult.repositoryContext, {
    commits: retrievalResult.commits.map((item) => item.item),
    pullRequests: retrievalResult.pullRequests.map((item) => item.item),
    issues: retrievalResult.issues.map((item) => item.item),
    documentation: retrievalResult.documentation.map((item) => item.item),
  });
}

function createMilestoneCandidates(
  pullRequests: RepositoryPullRequest[],
): StoryCandidate[] {
  return pullRequests
    .filter(
      (pullRequest) =>
        pullRequest.status === "merged" && pullRequest.mergedAt !== undefined,
    )
    .map((pullRequest) => ({
      id: `story:milestone:pull-request:${pullRequest.number}`,
      occurredAt: pullRequest.mergedAt,
      summary: `Major milestone: merged PR #${pullRequest.number} — ${pullRequest.title}.`,
      sourceIds: [`pull-request:${pullRequest.number}`],
      phases: ["major-milestone"] as RepositoryStoryPhase[],
    }));
}

function createArchitectureCandidates(
  pullRequests: RepositoryPullRequest[],
  documentation: NonNullable<RepositoryEvidenceData["documentation"]>,
): StoryCandidate[] {
  return [
    ...documentation
      .filter((document) =>
        ARCHITECTURE_PATTERN.test(
          `${document.path} ${document.title} ${document.summary}`,
        ),
      )
      .map((document) => ({
        id: `story:architecture:documentation:${document.path}`,
        occurredAt: document.updatedAt,
        summary: `Architectural decision recorded in ${document.path}: ${document.title}.`,
        sourceIds: [`documentation:${document.path}`],
        phases: ["architectural-decision"] as RepositoryStoryPhase[],
      })),
    ...pullRequests
      .filter((pullRequest) =>
        ARCHITECTURE_PATTERN.test(
          `${pullRequest.title} ${pullRequest.summary}`,
        ),
      )
      .map((pullRequest) => ({
        id: `story:architecture:pull-request:${pullRequest.number}`,
        occurredAt: pullRequest.mergedAt ?? pullRequest.createdAt,
        summary: `Architectural decision discussed in PR #${pullRequest.number}: ${pullRequest.title}.`,
        sourceIds: [`pull-request:${pullRequest.number}`],
        phases: ["architectural-decision"] as RepositoryStoryPhase[],
      })),
  ];
}

function createCriticalBugCandidates(
  issues: RepositoryIssue[],
): StoryCandidate[] {
  return issues
    .filter((issue) =>
      CRITICAL_BUG_PATTERN.test(
        `${issue.title} ${issue.summary} ${issue.labels.join(" ")}`,
      ),
    )
    .map((issue) => ({
      id: `story:bug:issue:${issue.number}`,
      occurredAt: issue.createdAt,
      summary: `Critical bug or risk recorded in issue #${issue.number}: ${issue.title}.`,
      sourceIds: [`issue:${issue.number}`],
      phases: ["critical-bug"] as RepositoryStoryPhase[],
    }));
}

function createRefactorCandidates(
  commits: RepositoryCommit[],
  pullRequests: RepositoryPullRequest[],
): StoryCandidate[] {
  return [
    ...commits
      .filter((commit) => REFACTOR_PATTERN.test(commit.message))
      .map((commit) => ({
        id: `story:refactor:commit:${commit.id}`,
        occurredAt: commit.authoredAt,
        summary: `Major refactor recorded in commit ${commit.id}: ${commit.message}.`,
        sourceIds: [`commit:${commit.id}`],
        phases: ["major-refactor"] as RepositoryStoryPhase[],
      })),
    ...pullRequests
      .filter((pullRequest) =>
        REFACTOR_PATTERN.test(`${pullRequest.title} ${pullRequest.summary}`),
      )
      .map((pullRequest) => ({
        id: `story:refactor:pull-request:${pullRequest.number}`,
        occurredAt: pullRequest.mergedAt ?? pullRequest.createdAt,
        summary: `Major refactor merged through PR #${pullRequest.number}: ${pullRequest.title}.`,
        sourceIds: [`pull-request:${pullRequest.number}`],
        phases: ["major-refactor"] as RepositoryStoryPhase[],
      })),
  ];
}

function createProjectBirthCandidate(
  commits: RepositoryCommit[],
  pullRequests: RepositoryPullRequest[],
  issues: RepositoryIssue[],
  documentation: NonNullable<RepositoryEvidenceData["documentation"]>,
): StoryCandidate | undefined {
  const candidates: StoryCandidate[] = [
    ...commits.map((commit) => ({
      id: `story:birth:commit:${commit.id}`,
      occurredAt: commit.authoredAt,
      summary: `Project birth evidence: commit ${commit.id} — ${commit.message}.`,
      sourceIds: [`commit:${commit.id}`],
      phases: ["project-birth"] as RepositoryStoryPhase[],
    })),
    ...pullRequests.map((pullRequest) => ({
      id: `story:birth:pull-request:${pullRequest.number}`,
      occurredAt: pullRequest.createdAt ?? pullRequest.mergedAt,
      summary: `Project birth evidence: PR #${pullRequest.number} — ${pullRequest.title}.`,
      sourceIds: [`pull-request:${pullRequest.number}`],
      phases: ["project-birth"] as RepositoryStoryPhase[],
    })),
    ...issues.map((issue) => ({
      id: `story:birth:issue:${issue.number}`,
      occurredAt: issue.createdAt,
      summary: `Project birth evidence: issue #${issue.number} — ${issue.title}.`,
      sourceIds: [`issue:${issue.number}`],
      phases: ["project-birth"] as RepositoryStoryPhase[],
    })),
    ...documentation.map((document) => ({
      id: `story:birth:documentation:${document.path}`,
      occurredAt: document.updatedAt,
      summary: `Project birth evidence: ${document.path} — ${document.title}.`,
      sourceIds: [`documentation:${document.path}`],
      phases: ["project-birth"] as RepositoryStoryPhase[],
    })),
  ];

  return sortStoryCandidates(candidates)[0];
}

function createCurrentStateCandidate(
  repositoryContext: RepositoryContext,
  candidates: StoryCandidate[],
  suppliedRecordCount: number,
): RepositoryStoryEvent {
  const latestCandidate = sortStoryCandidates(candidates).at(-1);

  if (!latestCandidate) {
    return {
      id: "story:current-state:unknown",
      summary:
        "Current state is unknown because no repository history was supplied.",
      evidenceIds: [],
      phases: ["current-state"],
    };
  }

  return {
    id: "story:current-state",
    occurredAt: latestCandidate.occurredAt,
    summary: `Current state for ${repositoryContext.repository} is based on ${suppliedRecordCount} supplied history records; latest observed event: ${latestCandidate.summary}`,
    evidenceIds: latestCandidate.sourceIds,
    phases: ["current-state"],
  };
}

function sortStoryCandidates(
  candidates: StoryCandidate[],
): StoryCandidate[] {
  return [...candidates].sort(
    (left, right) =>
      getTimestamp(left.occurredAt) - getTimestamp(right.occurredAt) ||
      left.id.localeCompare(right.id),
  );
}

function toStoryEvent(candidate: StoryCandidate): RepositoryStoryEvent {
  return {
    id: candidate.id,
    occurredAt: candidate.occurredAt,
    summary: candidate.summary,
    evidenceIds: candidate.sourceIds,
    phases: candidate.phases,
  };
}

function getTimestamp(occurredAt: string | undefined): number {
  const timestamp = occurredAt ? Date.parse(occurredAt) : Number.NaN;
  return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER;
}
