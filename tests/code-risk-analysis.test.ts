import assert from "node:assert/strict";
import test from "node:test";

import { analyzeCodeRisks } from "@/lib/risk";
import type { RetrievalResult } from "@/lib/retriever";

const retrievalResult: RetrievalResult = {
  repositoryContext: {
    repository: "acme/checkout-service",
    ref: "main",
    filePath: "src/auth.ts",
  },
  questionType: "BREAKAGE",
  commits: [
    {
      item: {
        id: "fix-auth",
        message: "Fix authentication regression",
        authoredAt: "2025-01-02T00:00:00Z",
        author: "Ada",
        files: ["src/auth.ts", "src/middleware.ts"],
      },
      score: 0.9,
      reasons: ["Same file."],
    },
    {
      item: {
        id: "auth-boundary",
        message: "Refactor authentication boundary",
        authoredAt: "2025-01-03T00:00:00Z",
        author: "Bea",
        files: ["src/auth.ts", "src/middleware.ts"],
      },
      score: 0.8,
      reasons: ["Same file."],
    },
  ],
  pullRequests: [
    {
      item: {
        number: 7,
        title: "Architecture decision: authentication boundary",
        author: "Ada",
        status: "merged",
        createdAt: "2025-01-01T00:00:00Z",
        mergedAt: "2025-01-03T00:00:00Z",
        commitIds: ["fix-auth", "auth-boundary"],
        summary: "Document the authentication design.",
      },
      score: 0.8,
      reasons: ["Linked PR."],
    },
  ],
  issues: [
    {
      item: {
        number: 42,
        title: "Security regression in authentication",
        status: "closed",
        createdAt: "2025-01-01T00:00:00Z",
        labels: ["bug", "security"],
        summary: "Unauthenticated requests reach protected endpoints.",
      },
      score: 0.9,
      reasons: ["Linked issue."],
    },
  ],
  documentation: [
    {
      item: {
        path: "docs/adr/authentication.md",
        title: "ADR: Authentication boundary",
        updatedAt: "2025-01-03T00:00:00Z",
        summary: "Architecture decision for endpoint protection.",
      },
      score: 0.8,
      reasons: ["Architecture decision."],
    },
  ],
};

test("Code Risk Analysis derives source-backed risk findings deterministically", () => {
  const analysis = analyzeCodeRisks(retrievalResult);

  assert.ok(
    analysis.likelyAffectedFiles.some(
      (file) => file.path === "src/auth.ts" && file.score > 0,
    ),
  );
  assert.ok(
    analysis.likelyAffectedFiles.some(
      (file) => file.path === "src/middleware.ts" && file.score > 0,
    ),
  );
  assert.deepEqual(analysis.dependencyRisks[0].relatedFiles, [
    "src/middleware.ts",
  ]);
  assert.ok(
    analysis.architecturalRisks.some(
      (risk) => risk.id === "architecture:concentrated-churn",
    ),
  );
  assert.ok(
    analysis.architecturalRisks.some(
      (risk) => risk.id === "architecture:decision-churn",
    ),
  );
  assert.ok(
    analysis.historicalRegressions.some((risk) =>
      risk.sourceIds.includes("issue:42"),
    ),
  );
  assert.ok(
    analysis.historicalRegressions.some((risk) =>
      risk.sourceIds.includes("commit:fix-auth"),
    ),
  );
});

test("Code Risk Analysis safely handles empty evidence", () => {
  const analysis = analyzeCodeRisks({
    ...retrievalResult,
    commits: [],
    pullRequests: [],
    issues: [],
    documentation: [],
  });

  assert.deepEqual(analysis.likelyAffectedFiles, []);
  assert.deepEqual(analysis.dependencyRisks, []);
  assert.deepEqual(analysis.architecturalRisks, []);
  assert.deepEqual(analysis.historicalRegressions, []);
});
