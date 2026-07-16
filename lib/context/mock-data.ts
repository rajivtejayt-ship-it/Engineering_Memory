import type { MockRepositoryData } from "./index";

/**
 * A medium-sized checkout-service repository fixture for local development and
 * tests. It intentionally mirrors common engineering history: feature work,
 * an incident, a regression fix, and supporting operational documentation.
 */
export const mockEngineeringRepositoryData: MockRepositoryData = {
  repository: "acme/checkout-service",
  ref: "main",
  filePath: "src/checkout/validation.ts",
  commits: [
    {
      id: "a4c19e2",
      message: "feat(checkout): add order validation pipeline",
      authoredAt: "2025-09-08T10:24:00Z",
      author: "Maya Chen",
      files: ["src/checkout/validation.ts", "src/checkout/types.ts"],
    },
    {
      id: "b5d2f73",
      message: "feat(payments): reject duplicate payment attempts",
      authoredAt: "2025-09-15T14:42:00Z",
      author: "Elliot Romero",
      files: ["src/payments/idempotency.ts", "src/payments/charge.ts"],
    },
    {
      id: "c81aa09",
      message: "feat(checkout): require inventory reservation before charge",
      authoredAt: "2025-10-03T09:17:00Z",
      author: "Maya Chen",
      files: ["src/checkout/validation.ts", "src/inventory/reservations.ts"],
    },
    {
      id: "d72e6b1",
      message: "fix(api): standardize checkout validation errors",
      authoredAt: "2025-10-18T16:05:00Z",
      author: "Priya Nair",
      files: ["src/api/errors.ts", "src/checkout/validation.ts"],
    },
    {
      id: "e34f0c8",
      message: "chore(deps): upgrade payment gateway client to v4",
      authoredAt: "2025-11-06T11:31:00Z",
      author: "Elliot Romero",
      files: ["package.json", "src/payments/client.ts"],
    },
    {
      id: "f9b14d5",
      message: "fix(checkout): restore guest checkout after client upgrade",
      authoredAt: "2025-11-09T13:48:00Z",
      author: "Priya Nair",
      files: ["src/checkout/validation.ts", "tests/checkout/guest-checkout.test.ts"],
    },
    {
      id: "0ab47ee",
      message: "feat(observability): add checkout failure metrics",
      authoredAt: "2025-11-21T08:55:00Z",
      author: "Noah Williams",
      files: ["src/observability/metrics.ts", "src/checkout/validation.ts"],
    },
    {
      id: "1c6d3f4",
      message: "docs(runbook): document payment timeout recovery",
      authoredAt: "2025-12-02T15:20:00Z",
      author: "Noah Williams",
      files: ["docs/runbooks/payment-timeouts.md"],
    },
  ],
  pullRequests: [
    {
      number: 184,
      title: "Add validation pipeline before payment authorization",
      status: "merged",
      mergedAt: "2025-09-08T12:02:00Z",
      commitIds: ["a4c19e2"],
      summary: "Prevents invalid addresses and malformed orders from reaching the payment gateway.",
    },
    {
      number: 201,
      title: "Reserve inventory before charging customers",
      status: "merged",
      mergedAt: "2025-10-03T11:46:00Z",
      commitIds: ["c81aa09"],
      summary: "Avoids successful charges for items that cannot be fulfilled.",
    },
    {
      number: 219,
      title: "Upgrade payment gateway client",
      status: "merged",
      mergedAt: "2025-11-06T14:09:00Z",
      commitIds: ["e34f0c8"],
      summary: "Adopts the gateway's updated authentication and timeout handling APIs.",
    },
    {
      number: 223,
      title: "Fix guest checkout regression",
      status: "merged",
      mergedAt: "2025-11-09T16:22:00Z",
      commitIds: ["f9b14d5"],
      summary: "Restores a missing guest customer identifier required by the upgraded client.",
    },
  ],
  issues: [
    {
      number: 176,
      title: "Duplicate charges after checkout retry",
      status: "closed",
      labels: ["bug", "payments", "high-priority"],
      summary: "Network retries could create more than one charge for a single order.",
    },
    {
      number: 193,
      title: "Prevent payment for out-of-stock items",
      status: "closed",
      labels: ["feature", "checkout", "inventory"],
      summary: "Customers could be charged after inventory was depleted by another order.",
    },
    {
      number: 221,
      title: "Guest checkout fails after gateway upgrade",
      status: "closed",
      labels: ["bug", "regression", "checkout"],
      summary: "Guest orders returned a validation error because the new gateway client expected a customer identifier.",
    },
    {
      number: 228,
      title: "Add dashboard for checkout validation failures",
      status: "open",
      labels: ["observability", "feature"],
      summary: "Support needs a breakdown of validation failures by rule and client version.",
    },
    {
      number: 231,
      title: "Document recovery from payment provider timeouts",
      status: "closed",
      labels: ["documentation", "operations"],
      summary: "On-call responders need a repeatable process for reconciling delayed payment confirmations.",
    },
  ],
  documentation: [
    {
      path: "README.md",
      title: "Checkout Service Overview",
      summary: "Describes service ownership, local setup, and checkout request flow.",
    },
    {
      path: "docs/architecture/checkout-flow.md",
      title: "Checkout Flow Architecture",
      summary: "Explains validation, inventory reservation, payment authorization, and order confirmation stages.",
    },
    {
      path: "docs/runbooks/payment-timeouts.md",
      title: "Payment Timeout Recovery",
      summary: "Provides investigation and reconciliation steps for delayed payment confirmations.",
    },
    {
      path: "docs/adr/004-inventory-reservation.md",
      title: "Reserve Inventory Before Payment",
      summary: "Records the decision to reserve stock before charging a customer.",
    },
  ],
  timeline: [
    {
      id: "event-1",
      occurredAt: "2025-09-08T12:02:00Z",
      summary: "Validation pipeline merged to reduce invalid payment requests.",
      evidenceIds: ["a4c19e2"],
    },
    {
      id: "event-2",
      occurredAt: "2025-09-15T17:10:00Z",
      summary: "Idempotency support shipped after duplicate-charge reports.",
      evidenceIds: ["b5d2f73", "issue-176"],
    },
    {
      id: "event-3",
      occurredAt: "2025-10-03T11:46:00Z",
      summary: "Inventory reservation moved before payment authorization.",
      evidenceIds: ["c81aa09", "pr-201"],
    },
    {
      id: "event-4",
      occurredAt: "2025-10-18T16:05:00Z",
      summary: "Checkout validation errors standardized for API clients.",
      evidenceIds: ["d72e6b1"],
    },
    {
      id: "event-5",
      occurredAt: "2025-11-06T14:09:00Z",
      summary: "Payment gateway client upgraded to version 4.",
      evidenceIds: ["e34f0c8", "pr-219"],
    },
    {
      id: "event-6",
      occurredAt: "2025-11-08T09:35:00Z",
      summary: "Guest checkout regression reported after the client upgrade.",
      evidenceIds: ["issue-221"],
    },
    {
      id: "event-7",
      occurredAt: "2025-11-09T16:22:00Z",
      summary: "Guest checkout regression fixed and covered with an integration test.",
      evidenceIds: ["f9b14d5", "pr-223"],
    },
    {
      id: "event-8",
      occurredAt: "2025-12-02T15:20:00Z",
      summary: "Payment timeout recovery runbook published for on-call responders.",
      evidenceIds: ["1c6d3f4"],
    },
  ],
};

/** Backwards-friendly short name for the default repository fixture. */
export const mockRepositoryData = mockEngineeringRepositoryData;
