import assert from "node:assert/strict";
import test from "node:test";

import {
  buildContextPackage,
  compressContextEvidence,
  MAX_CONTEXT_PACKAGE_CHARACTERS,
  type ContextEvidence,
} from "@/lib/context";
import type { RetrievalResult } from "@/lib/retriever";

function evidence(
  source: ContextEvidence["source"],
  priority: number,
  summary = "Repository evidence.",
): ContextEvidence {
  return {
    id: `${source}:1`,
    source,
    title: `${source} title`,
    summary,
    relevanceScore: 0.8,
    relevanceReasons: ["Relevant to the target file."],
    compressionPriority: priority,
  };
}

test("Context compression prioritizes issues, merged PRs, and commits", () => {
  const result = compressContextEvidence(
    [
      evidence("documentation", 100),
      evidence("commit", 200),
      evidence("pull-request", 300),
      evidence("issue", 400),
    ],
    {
      maxEvidenceItems: 3,
      maxCharacters: MAX_CONTEXT_PACKAGE_CHARACTERS,
    },
  );

  assert.deepEqual(
    result.evidence.map((item) => item.source),
    ["issue", "pull-request", "commit"],
  );
  assert.equal(result.truncated, true);
  assert.ok(result.characterCount < 8_000);
});

test("Context compression compacts oversized evidence within the package budget", () => {
  const result = compressContextEvidence(
    [evidence("issue", 400, "x".repeat(9_000))],
    {
      maxEvidenceItems: 12,
      maxCharacters: MAX_CONTEXT_PACKAGE_CHARACTERS,
    },
  );

  assert.equal(result.evidence.length, 1);
  assert.ok(result.evidence[0].summary.length <= 700);
  assert.ok(result.characterCount <= MAX_CONTEXT_PACKAGE_CHARACTERS);
  assert.equal(result.truncated, true);
});

test("Context Builder returns a bounded ContextPackage", () => {
  const retrievalResult: RetrievalResult = {
    repositoryContext: {
      repository: "acme/checkout-service",
      ref: "main",
      filePath: "src/auth.ts",
    },
    questionType: "WHY_INTRODUCED",
    commits: [
      {
        item: {
          id: "commit-1",
          message: "Add authentication guard",
          authoredAt: "2025-01-01T00:00:00Z",
          author: "Ada",
          files: ["src/auth.ts"],
        },
        score: 0.8,
        reasons: ["Same file."],
      },
    ],
    pullRequests: [
      {
        item: {
          number: 7,
          title: "Merge authentication guard",
          author: "Ada",
          status: "merged",
          createdAt: "2025-01-02T00:00:00Z",
          mergedAt: "2025-01-03T00:00:00Z",
          commitIds: ["commit-1"],
          summary: "Protects authenticated routes.",
        },
        score: 0.8,
        reasons: ["Linked pull request."],
      },
    ],
    issues: [
      {
        item: {
          number: 42,
          title: "Protect authenticated endpoints",
          status: "closed",
          createdAt: "2024-12-31T00:00:00Z",
          labels: ["security"],
          summary: "Unauthenticated requests reach protected routes.",
        },
        score: 0.8,
        reasons: ["Linked issue."],
      },
    ],
    documentation: [
      {
        item: {
          path: "docs/adr/authentication.md",
          title: "ADR: Authentication boundary",
          updatedAt: "2024-12-30T00:00:00Z",
          summary: "Architecture decision for endpoint authentication.",
        },
        score: 0.8,
        reasons: ["Architecture decision."],
      },
    ],
  };

  const contextPackage = buildContextPackage(retrievalResult, {
    maxEvidenceItems: 3,
  });

  assert.equal(contextPackage.totalEvidenceCount, 4);
  assert.equal(contextPackage.evidence.length, 3);
  assert.equal(
    contextPackage.evidence.some(
      (item) => item.id === "documentation:docs/adr/authentication.md",
    ),
    false,
  );
  assert.ok(contextPackage.characterCount <= MAX_CONTEXT_PACKAGE_CHARACTERS);
  assert.equal(contextPackage.truncated, true);
});
