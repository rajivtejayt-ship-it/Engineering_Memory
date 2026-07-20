import assert from "node:assert/strict";
import test from "node:test";

import { generateSuggestedFollowUpQuestions } from "@/lib/follow-ups";
import type { RetrievalResult } from "@/lib/retriever";
import type { Question } from "@/lib/types";

const question: Question = {
  id: "question-1",
  text: "Why was auth.ts introduced?",
};

function createResult(questionType: RetrievalResult["questionType"]): RetrievalResult {
  return {
    repositoryContext: {
      repository: "acme/checkout-service",
      filePath: "src/auth.ts",
    },
    questionType,
    commits: [],
    pullRequests: [],
    issues: [],
    documentation: [],
  };
}

test("follow-up generation returns three contextual introduction questions", () => {
  const suggestions = generateSuggestedFollowUpQuestions(
    question,
    createResult("WHY_INTRODUCED"),
  );

  assert.equal(suggestions.length, 3);
  assert.ok(suggestions.every((suggestion) => suggestion.includes("`src/auth.ts`")));
  assert.match(suggestions[1], /Who introduced/i);
  assert.match(suggestions[2], /broke or improved/i);
});

test("follow-up generation adapts questions to breakage analysis", () => {
  const suggestions = generateSuggestedFollowUpQuestions(
    question,
    createResult("BREAKAGE"),
  );

  assert.equal(suggestions.length, 3);
  assert.match(suggestions[0], /files or services.*break/i);
  assert.match(suggestions[1], /regression/i);
  assert.match(suggestions[2], /owns/i);
});
