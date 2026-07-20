import type { QuestionType } from "@/lib/constants";

/** A reusable engineering question fixture with its expected classifier intent. */
export interface SampleQuestion {
  /** Stable identifier for the fixture. */
  id: string;
  /** Natural-language engineering question to test. */
  question: string;
  /** Expected rule-based classification intent. */
  expectedIntent: QuestionType;
}

/** Realistic Engineering Memory questions for classifier and pipeline tests. */
export const sampleQuestions: SampleQuestion[] = [
  {
    id: "question-01",
    question: "Why was auth.ts introduced?",
    expectedIntent: "WHY_INTRODUCED",
  },
  {
    id: "question-02",
    question: "Why is cache.ts needed?",
    expectedIntent: "RELEVANCE",
  },
  {
    id: "question-03",
    question: "What breaks if logger.ts is removed?",
    expectedIntent: "BREAKAGE",
  },
  {
    id: "question-04",
    question: "Why was middleware changed?",
    expectedIntent: "WHY_CHANGED",
  },
  {
    id: "question-05",
    question: "Is retry.ts still relevant?",
    expectedIntent: "RELEVANCE",
  },
  {
    id: "question-06",
    question: "Why was the payment idempotency key added?",
    expectedIntent: "WHY_INTRODUCED",
  },
  {
    id: "question-07",
    question: "Why did src/api/errors.ts change its error response format?",
    expectedIntent: "WHY_CHANGED",
  },
  {
    id: "question-08",
    question: "Which checkout flow fails when inventory reservation times out?",
    expectedIntent: "BREAKAGE",
  },
  {
    id: "question-09",
    question: "Where is the feature-flag client used by the repository?",
    expectedIntent: "RELEVANCE",
  },
  {
    id: "question-10",
    question: "Why was the audit-events table created?",
    expectedIntent: "WHY_INTRODUCED",
  },
  {
    id: "question-11",
    question: "Why was the database connection pool updated?",
    expectedIntent: "WHY_CHANGED",
  },
  {
    id: "question-12",
    question: "Does removing the request correlation ID cause a regression?",
    expectedIntent: "BREAKAGE",
  },
  {
    id: "question-13",
    question: "What is the impact of changing the order validation pipeline?",
    expectedIntent: "RELEVANCE",
  },
  {
    id: "question-14",
    question: "Why was rate limiting introduced for public API endpoints?",
    expectedIntent: "WHY_INTRODUCED",
  },
  {
    id: "question-15",
    question: "Why did the session cookie settings change?",
    expectedIntent: "WHY_CHANGED",
  },
  {
    id: "question-16",
    question: "Why are webhook deliveries failing after the gateway upgrade?",
    expectedIntent: "BREAKAGE",
  },
  {
    id: "question-17",
    question: "Which services are affected by the shared authentication middleware?",
    expectedIntent: "RELEVANCE",
  },
  {
    id: "question-18",
    question: "Why was docs/adr/004-inventory-reservation.md added?",
    expectedIntent: "WHY_INTRODUCED",
  },
  {
    id: "question-19",
    question: "Why was the checkout timeout threshold modified?",
    expectedIntent: "WHY_CHANGED",
  },
  {
    id: "question-20",
    question: "What error occurs when the payment provider returns an invalid response?",
    expectedIntent: "BREAKAGE",
  },
  {
    id: "question-21",
    question: "Is the legacy metrics adapter used by any production workflow?",
    expectedIntent: "RELEVANCE",
  },
  {
    id: "question-22",
    question: "Why was a dead-letter queue introduced for failed jobs?",
    expectedIntent: "WHY_INTRODUCED",
  },
  {
    id: "question-23",
    question: "Why was the retry backoff policy changed after the incident?",
    expectedIntent: "WHY_CHANGED",
  },
  {
    id: "question-24",
    question: "What breaks if the inventory reservation check is skipped?",
    expectedIntent: "BREAKAGE",
  },
  {
    id: "question-25",
    question: "How does the repository use the feature-toggle configuration?",
    expectedIntent: "RELEVANCE",
  },
  {
    id: "question-26",
    question: "Why was the customer-notification worker created?",
    expectedIntent: "WHY_INTRODUCED",
  },
  {
    id: "question-27",
    question: "Why was src/payments/client.ts updated to use the new SDK?",
    expectedIntent: "WHY_CHANGED",
  },
  {
    id: "question-28",
    question: "Why does guest checkout return an error after a dependency upgrade?",
    expectedIntent: "BREAKAGE",
  },
  {
    id: "question-29",
    question: "What components depend on the request tracing module?",
    expectedIntent: "RELEVANCE",
  },
  {
    id: "question-30",
    question: "Why was the payment timeout recovery runbook introduced?",
    expectedIntent: "WHY_INTRODUCED",
  },
];
