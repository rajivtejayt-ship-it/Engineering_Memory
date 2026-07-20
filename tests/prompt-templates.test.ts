import assert from "node:assert/strict";
import test from "node:test";

import { getSystemPrompt, buildGeminiPrompt } from "@/lib/prompts";
import type { ContextPackage } from "@/lib/context";
import type { QuestionType } from "@/lib/constants";

const questionTypes: QuestionType[] = [
  "WHY_INTRODUCED",
  "WHY_CHANGED",
  "BREAKAGE",
  "RELEVANCE",
  "UNKNOWN",
];

const contextPackage: ContextPackage = {
  repositoryContext: {
    repository: "acme/checkout-service",
    ref: "main",
    filePath: "src/auth.ts",
  },
  questionType: "WHY_INTRODUCED",
  evidence: [
    {
      id: "issue:42",
      source: "issue",
      title: "Protect authenticated endpoints",
      summary: "Unauthenticated requests reach protected routes.",
      occurredAt: "2025-01-01T00:00:00Z",
      relevanceScore: 0.9,
      relevanceReasons: ["Same file and linked issue."],
    },
  ],
  totalEvidenceCount: 1,
  characterCount: 120,
  truncated: false,
};

test("all system prompts enforce evidence-led historical reasoning", () => {
  for (const questionType of questionTypes) {
    const prompt = getSystemPrompt(questionType);

    assert.match(prompt, /Repository Historian/i);
    assert.match(prompt, /not a coding assistant/i);
    assert.match(prompt, /senior software\s+engineers/i);
    assert.match(prompt, /why code exists/i);
    assert.match(prompt, /cite/i);
    assert.match(prompt, /trade-off/i);
    assert.match(prompt, /confidence/i);
    assert.match(prompt, /uncertainty/i);
    assert.match(prompt, /never invent/i);
  }
});

test("final Gemini prompts include evidence IDs and production response rules", () => {
  const prompt = buildGeminiPrompt(
    "WHY_INTRODUCED",
    contextPackage,
    "Why was auth.ts introduced?",
  );

  assert.match(prompt, /issue:42/);
  assert.match(prompt, /historical rationale/i);
  assert.match(prompt, /If a material claim cannot be cited, omit it/i);
  assert.match(prompt, /## Risks/);
  assert.match(prompt, /## Confidence/);
});
