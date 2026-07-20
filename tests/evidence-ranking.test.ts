import assert from "node:assert/strict";
import test from "node:test";

import {
  EvidenceRankingEngine,
  retrieveEvidence,
  type RepositoryEvidenceData,
} from "@/lib/retriever";
import type { RepositoryContext } from "@/lib/types";

const context: RepositoryContext = {
  repository: "acme/checkout-service",
  ref: "main",
  filePath: "src/auth.ts",
};

const repositoryData: RepositoryEvidenceData = {
  commits: [
    {
      id: "commit-auth",
      message: "Add auth guard",
      authoredAt: "2025-01-01T00:00:00Z",
      author: "Ada",
      files: ["src/auth.ts"],
      issueNumbers: [42],
      pullRequestNumber: 7,
    },
    {
      id: "commit-auth",
      message: "Add auth guard",
      authoredAt: "2025-01-01T00:00:00Z",
      author: "Ada",
      files: ["src/auth.ts"],
      issueNumbers: [42],
      pullRequestNumber: 7,
    },
    {
      id: "commit-session",
      message: "Refactor session handling",
      authoredAt: "2025-01-03T00:00:00Z",
      author: "Bea",
      files: ["src/session.ts"],
      issueNumbers: [42],
      pullRequestNumber: 7,
    },
  ],
  pullRequests: [
    {
      number: 7,
      title: "Introduce authentication guard",
      author: "Ada",
      status: "merged",
      createdAt: "2025-01-01T00:00:00Z",
      mergedAt: "2025-01-02T00:00:00Z",
      commitIds: ["commit-auth", "commit-session"],
      summary: "Addresses login protection.",
      issueNumbers: [42],
      files: ["src/auth.ts"],
    },
    {
      number: 8,
      title: "Follow-up session cleanup",
      author: "Bea",
      status: "merged",
      createdAt: "2025-01-03T00:00:00Z",
      mergedAt: "2025-01-04T00:00:00Z",
      commitIds: ["commit-session"],
      summary: "References the authentication issue.",
      issueNumbers: [42],
    },
  ],
  issues: [
    {
      number: 42,
      title: "Protect authenticated endpoints",
      status: "closed",
      createdAt: "2024-12-30T00:00:00Z",
      labels: ["security"],
      summary: "Unauthenticated requests reach protected routes.",
      pullRequestNumber: 7,
      relatedCommitIds: ["commit-auth"],
    },
  ],
};

test("Evidence Ranking Engine scores direct file and issue-linked evidence", () => {
  const ranked = new EvidenceRankingEngine().rank(
    context,
    repositoryData,
    "WHY_INTRODUCED",
  );
  const directCommit = ranked.commits.find(
    (item) => item.item.id === "commit-auth",
  );
  const issueLinkedPullRequest = ranked.pullRequests.find(
    (item) => item.item.number === 8,
  );

  assert.ok(directCommit);
  assert.ok(directCommit.score > 0.4);
  assert.match(directCommit.reasons.join(" "), /same file/i);
  assert.ok(issueLinkedPullRequest);
  assert.match(
    issueLinkedPullRequest.reasons.join(" "),
    /issue connected to the target file/i,
  );
});

test("Retriever returns only top-ranked unique evidence", () => {
  const result = retrieveEvidence(
    context,
    "WHY_INTRODUCED",
    repositoryData,
    { maxResultsPerType: 1 },
  );

  assert.equal(result.commits.length, 1);
  assert.equal(result.commits[0].item.id, "commit-auth");
  assert.equal(result.pullRequests.length, 1);
  assert.equal(result.pullRequests[0].item.number, 7);
  assert.equal(result.issues.length, 1);
});

test("Evidence Ranking Engine falls back to question semantics without file relationships", () => {
  const lightweightData: RepositoryEvidenceData = {
    commits: [
      {
        id: "commit-auth",
        message: "Introduce authentication middleware",
        authoredAt: "2025-01-01T00:00:00Z",
        author: "Ada",
        files: [],
      },
      {
        id: "commit-unrelated",
        message: "Refresh dashboard colors",
        authoredAt: "2025-01-02T00:00:00Z",
        author: "Bea",
        files: [],
      },
    ],
  };

  const ranked = new EvidenceRankingEngine(
    "Why was authentication middleware introduced?",
  ).rank(context, lightweightData, "WHY_INTRODUCED");
  const authenticationCommit = ranked.commits.find(
    (item) => item.item.id === "commit-auth",
  );
  const unrelatedCommit = ranked.commits.find(
    (item) => item.item.id === "commit-unrelated",
  );

  assert.ok(authenticationCommit);
  assert.ok(unrelatedCommit);
  assert.ok(authenticationCommit.score > unrelatedCommit.score);
  assert.match(
    authenticationCommit.reasons.join(" "),
    /matches question keywords/i,
  );
});
