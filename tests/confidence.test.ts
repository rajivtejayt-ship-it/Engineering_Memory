import assert from "node:assert/strict";
import test from "node:test";

import { calculateEvidenceConfidence } from "@/lib/confidence";
import type { RetrievalResult } from "@/lib/retriever";

const repositoryContext = {
  repository: "acme/checkout-service",
  ref: "main",
  filePath: "src/auth.ts",
};

function createResult(
  overrides: Partial<RetrievalResult> = {},
): RetrievalResult {
  return {
    repositoryContext,
    questionType: "WHY_INTRODUCED",
    commits: [],
    pullRequests: [],
    issues: [],
    documentation: [],
    ...overrides,
  };
}

test("confidence increases for corroborating commits, issue, merged PR, and docs", () => {
  const assessment = calculateEvidenceConfidence(
    createResult({
      commits: ["a1", "a2", "a3"].map((id) => ({
        item: {
          id,
          message: "Introduce auth guard for protected routes",
          authoredAt: "2025-01-01T00:00:00Z",
          author: "Ada",
          files: ["src/auth.ts"],
          issueNumbers: [42],
          pullRequestNumber: 7,
        },
        score: 1,
        reasons: ["same file"],
      })),
      issues: [
        {
          item: {
            number: 42,
            title: "Protect authenticated endpoints",
            status: "closed",
            labels: ["security"],
            summary: "Unauthenticated requests reach protected routes.",
            discussionCount: 2,
          },
          score: 1,
          reasons: ["linked issue"],
        },
      ],
      pullRequests: [
        {
          item: {
            number: 7,
            title: "Add authentication guard",
            author: "Ada",
            status: "merged",
            commitIds: ["a1", "a2", "a3"],
            summary: "Protects routes discussed in issue #42.",
          },
          score: 1,
          reasons: ["linked pull request"],
        },
      ],
      documentation: [
        {
          item: {
            path: "docs/auth.md",
            title: "Authentication decisions",
            summary: "Protected routes require an authentication guard.",
          },
          score: 1,
          reasons: ["architecture documentation"],
        },
      ],
    }),
  );

  assert.equal(assessment.score, 95);
  assert.equal(assessment.level, "HIGH");
  assert.match(assessment.explanation, /3 commits corroborate/i);
  assert.match(assessment.explanation, /merged pull request/i);
  assert.match(assessment.explanation, /documentation/i);
});

test("confidence decreases for sparse, conflicting history and missing discussions", () => {
  const assessment = calculateEvidenceConfidence(
    createResult({
      commits: [
        {
          item: {
            id: "a1",
            message: "Add auth guard",
            authoredAt: "2025-01-01T00:00:00Z",
            author: "Ada",
            files: ["src/auth.ts"],
          },
          score: 0.5,
          reasons: [],
        },
        {
          item: {
            id: "a2",
            message: "Revert auth guard after regression",
            authoredAt: "2025-01-02T00:00:00Z",
            author: "Bea",
            files: ["src/auth.ts"],
          },
          score: 0.5,
          reasons: [],
        },
      ],
      issues: [
        {
          item: {
            number: 42,
            title: "Authentication regression",
            status: "open",
            labels: [],
            summary: "Regression needs investigation.",
            discussionCount: 0,
          },
          score: 0.5,
          reasons: [],
        },
      ],
    }),
  );

  assert.equal(assessment.level, "LOW");
  assert.match(assessment.explanation, /history is sparse/i);
  assert.match(assessment.explanation, /conflicting or reverted/i);
  assert.match(assessment.explanation, /No issue discussion records/i);
});

test("empty evidence returns a zero score and explanation", () => {
  const assessment = calculateEvidenceConfidence(createResult());

  assert.equal(assessment.score, 0);
  assert.equal(assessment.level, "LOW");
  assert.match(assessment.explanation, /No repository evidence was retrieved/i);
});
