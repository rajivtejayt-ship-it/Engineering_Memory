import assert from "node:assert/strict";
import test from "node:test";

import { RepositoryApiAdapter } from "@/lib/adapters/repository-adapter";
import { EngineeringMemoryCore } from "@/lib/agent";
import { buildContextPackage } from "@/lib/context";
import { createEvidenceRetriever } from "@/lib/retriever";
import type { AIResponse, Question } from "@/lib/types";

const question: Question = {
  id: "test-question",
  text: "Why was auth.ts introduced?",
};

function createFormattedResponse(): AIResponse {
  return {
    summary: "No repository evidence was retrieved.",
    answer: "No repository evidence was retrieved.",
    evidence: [],
    timeline: [],
    risks: [],
    suggestedNextQuestions: [],
    metadata: {
      retrievedEvidenceCount: 0,
      confidence: 0,
      retrievalTimeMs: 0,
      reasoningTimeMs: 0,
      promptSize: 0,
    },
    explainability: {
      evidenceUsed: {
        total: 0,
        commitIds: [],
        pullRequestNumbers: [],
        issueNumbers: [],
        documentationPaths: [],
      },
      timelineLength: 0,
      promptSize: 0,
      retrievalTimeMs: 0,
      reasoningTimeMs: 0,
      confidence: {
        score: 0,
        level: "LOW",
        explanation: "No evidence.",
      },
      reasoningQuality: {
        level: "LOW",
        explanation: "No evidence.",
      },
    },
  };
}

test("Core adapts a backend repository payload and handles an empty repository", async () => {
  const core = new EngineeringMemoryCore({
    classifier: () => ({
      intent: "WHY_INTRODUCED",
      confidence: 1,
      detectedTarget: "auth.ts",
      scope: "file",
    }),
    repositoryAdapter: new RepositoryApiAdapter(),
    retriever: createEvidenceRetriever({
      getRepositoryData: async () => undefined,
    }),
    contextBuilder: buildContextPackage,
    promptBuilder: () => "test prompt",
    geminiClient: async () => "## Summary\nNo evidence.",
    responseFormatter: createFormattedResponse,
  });

  const response = await core.answerFromBackend(question, {
    full_name: "acme/checkout-service",
    default_branch: "main",
    file_path: "/src/auth.ts",
  });

  assert.equal(response.metadata.retrievedEvidenceCount, 0);
  assert.equal(response.metadata.confidence, 0);
  assert.equal(response.metadata.promptSize, "test prompt".length);
  assert.deepEqual(response.explainability.evidenceUsed, {
    total: 0,
    commitIds: [],
    pullRequestNumbers: [],
    issueNumbers: [],
    documentationPaths: [],
  });
  assert.equal(response.explainability.timelineLength, 0);
  assert.equal(response.explainability.confidence.score, 0);
  assert.equal(response.explainability.reasoningQuality.level, "LOW");
  assert.deepEqual(response.sources, []);
  assert.deepEqual(response.timeline, []);
  assert.equal(response.suggestedNextQuestions?.length, 3);
});

test("Core tolerates missing commit, pull-request, and issue collections", async () => {
  const core = new EngineeringMemoryCore({
    classifier: () => ({
      intent: "WHY_INTRODUCED",
      confidence: 1,
      detectedTarget: "auth.ts",
      scope: "file",
    }),
    repositoryAdapter: new RepositoryApiAdapter(),
    retriever: createEvidenceRetriever({
      getRepositoryData: async () => ({
        commits: undefined,
        pullRequests: undefined,
        issues: undefined,
        documentation: undefined,
      }),
    }),
    contextBuilder: buildContextPackage,
    promptBuilder: () => "test prompt",
    geminiClient: async () => "## Summary\nNo evidence.",
    responseFormatter: createFormattedResponse,
  });

  const response = await core.answerFromBackend(question, {
    repository: "acme/checkout-service",
    ref: "main",
    filePath: "src/auth.ts",
  });

  assert.equal(response.metadata.retrievedEvidenceCount, 0);
  assert.equal(response.confidence?.score, 0);
  assert.match(
    response.confidence?.explanation ?? "",
    /No repository evidence was retrieved/i,
  );
  assert.deepEqual(response.sources, []);
  assert.deepEqual(response.timeline, []);
});
