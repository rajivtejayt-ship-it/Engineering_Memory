import assert from "node:assert/strict";
import test from "node:test";

import { generateRepositoryInsights } from "@/lib/insights";

const context = { repository: "acme/checkout-service", ref: "main" };

test("repository insights identify churn, risk, stale areas, and active legacy modules", () => {
  const insights = generateRepositoryInsights(context, {
    commits: [
      {
        id: "old-core",
        message: "Introduce checkout core",
        authoredAt: "2024-01-01T00:00:00Z",
        author: "Ada",
        files: ["src/core.ts", "legacy/parser.ts"],
      },
      {
        id: "auth-fix",
        message: "Fix auth security regression",
        authoredAt: "2025-01-01T00:00:00Z",
        author: "Bea",
        files: ["src/auth.ts", "src/core.ts"],
      },
      {
        id: "core-refactor",
        message: "Refactor checkout core",
        authoredAt: "2025-01-03T00:00:00Z",
        author: "Bea",
        files: ["src/core.ts"],
      },
    ],
  });

  assert.equal(insights.mostModifiedFiles[0].path, "src/core.ts");
  assert.ok(insights.engineeringHotspots.some((file) => file.path === "src/core.ts"));
  assert.ok(insights.highRiskFiles.some((file) => file.path === "src/auth.ts"));
  assert.ok(insights.frequentlyChangingFiles.some((file) => file.path === "src/core.ts"));
  assert.ok(insights.deadAreas.some((area) => area.path === "legacy"));
  assert.equal(insights.oldestActiveModules[0].path, "src/core.ts");
});

test("repository insights handle missing repository collections", () => {
  const insights = generateRepositoryInsights(context, {});

  assert.deepEqual(insights.mostModifiedFiles, []);
  assert.deepEqual(insights.deadAreas, []);
  assert.deepEqual(insights.oldestActiveModules, []);
});
