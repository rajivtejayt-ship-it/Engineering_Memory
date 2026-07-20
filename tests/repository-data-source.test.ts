import assert from "node:assert/strict";
import test from "node:test";

import {
  createProductionRepositoryDataSource,
} from "@/lib/context/repository-data-source";
import { adaptCollectorRepositoryContext } from "@/lib/context/collector-retrieval-adapter";
import type { RepositoryContext as CollectedRepositoryContext } from "@/types/context";

const collectedContext: CollectedRepositoryContext = {
  repository: {
    owner: {
      login: "acme",
      displayName: "Acme",
      avatarUrl: null,
      profileUrl: "https://github.com/acme",
    },
    name: "checkout-service",
    fullName: "acme/checkout-service",
    url: "https://github.com/acme/checkout-service",
    description: null,
    defaultBranch: "main",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z",
    statistics: { stars: 0, forks: 0, openIssues: 0, watchers: 0 },
    languages: [],
    branches: [],
  },
  commits: [
    {
      sha: "abc123",
      message: "Add checkout validation",
      author: {
        login: "ada",
        displayName: "Ada",
        avatarUrl: null,
        profileUrl: "https://github.com/ada",
      },
      authoredAt: "2025-01-03T00:00:00Z",
      url: "https://github.com/acme/checkout-service/commit/abc123",
      files: [],
    },
  ],
  pullRequests: [
    {
      number: 7,
      title: "Validate checkout requests",
      body: null,
      state: "MERGED",
      author: null,
      createdAt: "2025-01-02T00:00:00Z",
      closedAt: "2025-01-04T00:00:00Z",
      mergedAt: "2025-01-04T00:00:00Z",
      url: "https://github.com/acme/checkout-service/pull/7",
      files: [],
    },
  ],
  issues: [
    {
      number: 42,
      title: "Reject incomplete checkout requests",
      body: null,
      state: "CLOSED",
      author: null,
      createdAt: "2025-01-01T00:00:00Z",
      closedAt: "2025-01-04T00:00:00Z",
      url: "https://github.com/acme/checkout-service/issues/42",
    },
  ],
  discussions: [],
  relatedFiles: [
    {
      change: {
        path: "docs/architecture.md",
        previousPath: null,
        status: "MODIFIED",
        additions: 1,
        deletions: 0,
      },
      relevance: "Documents the checkout validation boundary.",
    },
  ],
  riskAreas: [],
  timeline: [],
};

test("collector context adapts to normalized retrieval evidence", () => {
  const evidence = adaptCollectorRepositoryContext(collectedContext);

  assert.equal(evidence.commits?.[0].id, "abc123");
  assert.equal(evidence.commits?.[0].author, "Ada");
  assert.equal(evidence.pullRequests?.[0].status, "merged");
  assert.equal(evidence.issues?.[0].status, "closed");
  assert.deepEqual(evidence.documentation, [
    {
      path: "docs/architecture.md",
      title: "docs/architecture.md",
      summary: "Documents the checkout validation boundary.",
    },
  ]);
});

test("production source resolves an imported repository before collecting evidence", async () => {
  const source = createProductionRepositoryDataSource({
    findRepositoryById: async (repositoryId) =>
      repositoryId === "repository-id"
        ? { owner: "acme", name: "checkout-service" }
        : null,
    collectRepositoryContext: async (owner, repository) => {
      assert.equal(owner, "acme");
      assert.equal(repository, "checkout-service");
      return collectedContext;
    },
  });

  const evidence = await source.getRepositoryData({
    repository: "repository-id",
    filePath: "src/checkout.ts",
  });

  assert.equal(evidence?.commits?.length, 1);
  assert.equal(evidence?.pullRequests?.length, 1);
  assert.equal(evidence?.issues?.length, 1);
  assert.equal(evidence?.documentation?.length, 1);
});
