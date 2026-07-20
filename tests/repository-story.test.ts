import assert from "node:assert/strict";
import test from "node:test";

import { generateRepositoryStory } from "@/lib/story";

const repositoryContext = {
  repository: "acme/checkout-service",
  ref: "main",
  filePath: "src/auth.ts",
};

test("Repository Story generates chronological dashboard chapters", () => {
  const story = generateRepositoryStory(repositoryContext, {
    commits: [
      {
        id: "birth",
        message: "Create checkout service",
        authoredAt: "2025-01-01T00:00:00Z",
        author: "Ada",
        files: ["src/index.ts"],
      },
      {
        id: "refactor",
        message: "Refactor authentication boundary",
        authoredAt: "2025-01-05T00:00:00Z",
        author: "Bea",
        files: ["src/auth.ts"],
      },
    ],
    pullRequests: [
      {
        number: 7,
        title: "Architecture decision: authentication boundary",
        author: "Ada",
        status: "merged",
        createdAt: "2025-01-02T00:00:00Z",
        mergedAt: "2025-01-03T00:00:00Z",
        commitIds: ["birth"],
        summary: "Define the service authentication design.",
      },
    ],
    issues: [
      {
        number: 42,
        title: "Critical authentication regression",
        status: "closed",
        createdAt: "2025-01-02T00:00:00Z",
        labels: ["bug", "security"],
        summary: "Protected endpoints allow unauthenticated requests.",
      },
    ],
    documentation: [
      {
        path: "docs/adr/authentication.md",
        title: "ADR: Authentication boundary",
        updatedAt: "2025-01-02T12:00:00Z",
        summary: "Architecture decision for endpoint protection.",
      },
    ],
  });

  assert.equal(story.events[0].phases.includes("project-birth"), true);
  assert.equal(
    story.events.some((event) => event.phases.includes("major-milestone")),
    true,
  );
  assert.equal(
    story.events.some((event) => event.phases.includes("architectural-decision")),
    true,
  );
  assert.equal(
    story.events.some((event) => event.phases.includes("critical-bug")),
    true,
  );
  assert.equal(
    story.events.some((event) => event.phases.includes("major-refactor")),
    true,
  );
  assert.equal(
    story.events.at(-1)?.phases.includes("current-state"),
    true,
  );
  assert.ok(
    story.events.some((event) => event.evidenceIds?.includes("issue:42")),
  );
  assert.ok(
    story.events.some((event) => event.evidenceIds?.includes("pull-request:7")),
  );
  assert.ok(
    story.events.some((event) => event.evidenceIds?.includes("commit:refactor")),
  );
});

test("Repository Story handles a context without repository history", () => {
  const story = generateRepositoryStory(repositoryContext);

  assert.equal(story.events.length, 1);
  assert.deepEqual(story.events[0].phases, ["current-state"]);
  assert.match(story.events[0].summary, /no repository history was supplied/i);
});
