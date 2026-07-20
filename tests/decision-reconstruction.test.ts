import assert from "node:assert/strict";
import test from "node:test";

import { reconstructEngineeringDecision } from "@/lib/decisions";

test("reconstructs a source-cited engineering decision history", () => {
  const reconstruction = reconstructEngineeringDecision({
    issues: [
      {
        number: 42,
        title: "Unauthenticated requests reach protected routes",
        status: "closed",
        labels: ["security"],
        summary: "A security regression allows requests without a session.",
        createdAt: "2025-01-01T00:00:00Z",
      },
    ],
    discussions: [
      {
        id: "d1",
        createdAt: "2025-01-02T00:00:00Z",
        body: "Consider middleware instead of route-level checks to avoid duplicated authorization logic.",
      },
      {
        id: "d2",
        createdAt: "2025-01-02T01:00:00Z",
        body: "The middleware option adds migration complexity for legacy routes.",
      },
    ],
    pullRequests: [
      {
        number: 7,
        title: "Introduce authentication middleware",
        author: "Ada",
        status: "merged",
        createdAt: "2025-01-03T00:00:00Z",
        mergedAt: "2025-01-04T00:00:00Z",
        commitIds: ["a1"],
        summary: "Adds a shared guard for protected routes.",
      },
    ],
    commits: [
      {
        id: "a1",
        message: "Add authentication middleware",
        authoredAt: "2025-01-03T00:00:00Z",
        author: "Ada",
        files: ["src/middleware.ts"],
      },
      {
        id: "a2",
        message: "Refactor authentication middleware for new routes",
        authoredAt: "2025-02-01T00:00:00Z",
        author: "Bea",
        files: ["src/middleware.ts"],
      },
    ],
    timeline: [
      {
        id: "timeline:issue:42",
        occurredAt: "2025-01-01T00:00:00Z",
        summary: "Security issue opened.",
      },
    ],
  });

  assert.match(reconstruction.originalProblem.summary, /security regression/i);
  assert.deepEqual(reconstruction.originalProblem.evidenceIds, ["issue:42"]);
  assert.ok(reconstruction.alternativesConsidered.length >= 1);
  assert.ok(
    reconstruction.alternativesConsidered.some((finding) =>
      /middleware instead/i.test(finding.summary),
    ),
  );
  assert.match(reconstruction.chosenSolution.summary, /authentication middleware/i);
  assert.ok(
    reconstruction.tradeoffs.some((finding) =>
      /migration complexity/i.test(finding.summary),
    ),
  );
  assert.match(reconstruction.longTermImpact.summary, /Refactor/i);
  assert.equal(reconstruction.timeline[0].id, "timeline:issue:42");
});

test("marks missing decision history as unknown rather than speculating", () => {
  const reconstruction = reconstructEngineeringDecision({});

  assert.equal(reconstruction.evidenceCount, 0);
  assert.equal(reconstruction.originalProblem.certainty, "unknown");
  assert.equal(reconstruction.chosenSolution.certainty, "unknown");
  assert.equal(reconstruction.longTermImpact.certainty, "unknown");
  assert.deepEqual(reconstruction.alternativesConsidered, []);
  assert.deepEqual(reconstruction.tradeoffs, []);
});
