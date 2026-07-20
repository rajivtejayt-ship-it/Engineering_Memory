import type {
  MockCommit,
  MockContributor,
  MockDocumentation,
  MockFileHistory,
  MockIssue,
  MockPullRequest,
  MockRepositoryData,
} from "./index";

interface PullRequestDefinition {
  number: number;
  start: number;
  end: number;
  scope: string;
  title: string;
  author: string;
  summary: string;
  files: string[];
}

interface IssueDefinition {
  title: string;
  labels: string[];
  summary: string;
  status: "open" | "closed";
}

const contributors: MockContributor[] = [
  { id: "maya-chen", name: "Maya Chen", role: "Staff Backend Engineer" },
  { id: "elliot-romero", name: "Elliot Romero", role: "Payments Engineer" },
  { id: "priya-nair", name: "Priya Nair", role: "Platform Engineer" },
  { id: "noah-williams", name: "Noah Williams", role: "Reliability Engineer" },
  { id: "sara-kim", name: "Sara Kim", role: "Product Engineer" },
  { id: "diego-alvarez", name: "Diego Alvarez", role: "Data Engineer" },
  { id: "lena-petrov", name: "Lena Petrov", role: "Security Engineer" },
  { id: "omar-hassan", name: "Omar Hassan", role: "Developer Experience Engineer" },
];

const pullRequestDefinitions: PullRequestDefinition[] = [
  {
    number: 101,
    start: 1,
    end: 7,
    scope: "checkout",
    title: "Add checkout validation pipeline",
    author: "Maya Chen",
    summary: "Introduces validation before payment authorization to reject malformed orders.",
    files: ["src/checkout/validation.ts", "src/checkout/types.ts", "tests/checkout/validation.test.ts"],
  },
  {
    number: 102,
    start: 8,
    end: 14,
    scope: "payments",
    title: "Add idempotent payment authorization",
    author: "Elliot Romero",
    summary: "Prevents duplicate charges when clients retry payment authorization.",
    files: ["src/payments/idempotency.ts", "src/payments/charge.ts", "tests/payments/idempotency.test.ts"],
  },
  {
    number: 103,
    start: 15,
    end: 21,
    scope: "inventory",
    title: "Reserve inventory before payment capture",
    author: "Maya Chen",
    summary: "Moves stock reservation ahead of capture to avoid charging for unavailable items.",
    files: ["src/inventory/reservations.ts", "src/checkout/validation.ts", "docs/adr/004-inventory-reservation.md"],
  },
  {
    number: 104,
    start: 22,
    end: 28,
    scope: "api",
    title: "Standardize checkout API errors",
    author: "Priya Nair",
    summary: "Creates stable API error codes and response envelopes for checkout clients.",
    files: ["src/api/errors.ts", "src/api/checkout-route.ts", "tests/api/errors.test.ts"],
  },
  {
    number: 105,
    start: 29,
    end: 35,
    scope: "payments",
    title: "Upgrade payment gateway client to v4",
    author: "Elliot Romero",
    summary: "Adopts the gateway's revised authentication, timeout, and retry APIs.",
    files: ["src/payments/client.ts", "src/payments/charge.ts", "package.json"],
  },
  {
    number: 106,
    start: 36,
    end: 42,
    scope: "checkout",
    title: "Restore guest checkout after client upgrade",
    author: "Priya Nair",
    summary: "Restores the guest customer identifier required by the gateway v4 client.",
    files: ["src/checkout/validation.ts", "src/payments/client.ts", "tests/checkout/guest-checkout.test.ts"],
  },
  {
    number: 107,
    start: 43,
    end: 49,
    scope: "observability",
    title: "Add checkout failure metrics and tracing",
    author: "Noah Williams",
    summary: "Adds validation, gateway, and inventory failure metrics with request tracing.",
    files: ["src/observability/metrics.ts", "src/observability/tracing.ts", "src/checkout/validation.ts"],
  },
  {
    number: 108,
    start: 50,
    end: 56,
    scope: "webhooks",
    title: "Add reliable payment webhook processing",
    author: "Sara Kim",
    summary: "Introduces signature verification, durable delivery tracking, and replay protection.",
    files: ["src/webhooks/handler.ts", "src/webhooks/signature.ts", "tests/webhooks/handler.test.ts"],
  },
  {
    number: 109,
    start: 57,
    end: 63,
    scope: "jobs",
    title: "Route failed jobs to a dead-letter queue",
    author: "Diego Alvarez",
    summary: "Preserves failed asynchronous jobs for inspection and controlled replay.",
    files: ["src/jobs/worker.ts", "src/jobs/dead-letter.ts", "docs/runbooks/job-recovery.md"],
  },
  {
    number: 110,
    start: 64,
    end: 70,
    scope: "security",
    title: "Harden session and service authentication",
    author: "Lena Petrov",
    summary: "Rotates session keys, tightens cookie attributes, and validates service tokens.",
    files: ["src/auth/session.ts", "src/auth/service-token.ts", "tests/auth/session.test.ts"],
  },
  {
    number: 111,
    start: 71,
    end: 76,
    scope: "rate-limit",
    title: "Add adaptive rate limiting for public checkout endpoints",
    author: "Omar Hassan",
    summary: "Protects public endpoints while preserving headroom for trusted internal callers.",
    files: ["src/api/rate-limit.ts", "src/api/checkout-route.ts", "tests/api/rate-limit.test.ts"],
  },
  {
    number: 112,
    start: 77,
    end: 82,
    scope: "notifications",
    title: "Add customer payment notification worker",
    author: "Sara Kim",
    summary: "Sends durable payment receipts and failure notifications from asynchronous events.",
    files: ["src/notifications/worker.ts", "src/notifications/templates.ts", "tests/notifications/worker.test.ts"],
  },
  {
    number: 113,
    start: 83,
    end: 88,
    scope: "reporting",
    title: "Introduce daily payment reconciliation report",
    author: "Diego Alvarez",
    summary: "Reconciles gateway settlements with internal payment records each day.",
    files: ["src/reporting/reconciliation.ts", "src/payments/ledger.ts", "docs/runbooks/reconciliation.md"],
  },
  {
    number: 114,
    start: 89,
    end: 94,
    scope: "checkout",
    title: "Tune retry and timeout policy after incident review",
    author: "Noah Williams",
    summary: "Reduces retry amplification and documents recovery behavior for payment timeouts.",
    files: ["src/payments/retry.ts", "src/payments/client.ts", "docs/runbooks/payment-timeouts.md"],
  },
  {
    number: 115,
    start: 95,
    end: 100,
    scope: "developer-experience",
    title: "Document local checkout development and diagnostics",
    author: "Omar Hassan",
    summary: "Adds architecture guidance, local fixtures, and operational diagnostics for contributors.",
    files: ["README.md", "docs/architecture/checkout-flow.md", "docs/development/local-checkout.md"],
  },
];

const issueDefinitions: IssueDefinition[] = [
  { title: "Reject malformed checkout addresses", labels: ["feature", "checkout"], summary: "Invalid address payloads reach payment authorization.", status: "closed" },
  { title: "Expose validation failures to clients", labels: ["api", "checkout"], summary: "Clients need stable validation failure details.", status: "closed" },
  { title: "Prevent duplicate charges on retry", labels: ["bug", "payments"], summary: "Network retries can create more than one authorization.", status: "closed" },
  { title: "Persist idempotency keys across worker restarts", labels: ["payments", "reliability"], summary: "In-memory keys are lost during deployments.", status: "closed" },
  { title: "Avoid charging for unavailable inventory", labels: ["feature", "inventory"], summary: "Stock must be reserved before payment capture.", status: "closed" },
  { title: "Document inventory reservation decision", labels: ["documentation", "architecture"], summary: "Record the order-of-operations trade-off.", status: "closed" },
  { title: "Normalize checkout error response payloads", labels: ["api", "client-experience"], summary: "Consumers parse inconsistent checkout errors.", status: "closed" },
  { title: "Add error-code contract tests", labels: ["testing", "api"], summary: "Error-code compatibility requires regression coverage.", status: "closed" },
  { title: "Upgrade deprecated payment gateway SDK", labels: ["dependencies", "payments"], summary: "The existing SDK reaches end of support.", status: "closed" },
  { title: "Audit v4 gateway timeout semantics", labels: ["payments", "reliability"], summary: "Timeout behavior changed in the new client.", status: "closed" },
  { title: "Fix guest checkout gateway regression", labels: ["bug", "regression", "checkout"], summary: "Guest orders omit an identifier required by v4.", status: "closed" },
  { title: "Add coverage for guest payment retries", labels: ["testing", "checkout"], summary: "Guest retries need end-to-end validation.", status: "closed" },
  { title: "Measure validation failure rates", labels: ["observability", "checkout"], summary: "Support cannot quantify validation failures today.", status: "closed" },
  { title: "Trace payment authorization latency", labels: ["observability", "payments"], summary: "Slow gateway calls need request-level diagnostics.", status: "closed" },
  { title: "Verify webhook signatures", labels: ["security", "webhooks"], summary: "Unverified callbacks can mutate payment state.", status: "closed" },
  { title: "Replay missed payment webhooks safely", labels: ["reliability", "webhooks"], summary: "Delivery interruptions require idempotent replay.", status: "closed" },
  { title: "Preserve failed worker jobs", labels: ["reliability", "jobs"], summary: "Failed jobs are currently discarded after retries.", status: "closed" },
  { title: "Create job recovery runbook", labels: ["documentation", "operations"], summary: "On-call needs a repeatable replay procedure.", status: "closed" },
  { title: "Rotate session signing keys", labels: ["security", "auth"], summary: "Session signing keys need scheduled rotation.", status: "closed" },
  { title: "Restrict service-token audiences", labels: ["security", "auth"], summary: "Service tokens should not work across unrelated services.", status: "closed" },
  { title: "Limit abusive public checkout traffic", labels: ["security", "api"], summary: "Public endpoints are vulnerable to request bursts.", status: "closed" },
  { title: "Preserve trusted partner throughput", labels: ["performance", "api"], summary: "Partner traffic needs a separate rate-limit policy.", status: "closed" },
  { title: "Send payment receipt notifications", labels: ["feature", "notifications"], summary: "Customers need reliable receipt delivery.", status: "closed" },
  { title: "Retry transient notification provider failures", labels: ["reliability", "notifications"], summary: "Temporary provider errors should not drop notices.", status: "closed" },
  { title: "Reconcile settlement and ledger records", labels: ["reporting", "payments"], summary: "Finance needs a daily settlement comparison.", status: "closed" },
  { title: "Alert on reconciliation mismatches", labels: ["observability", "reporting"], summary: "Mismatches need an operational alert.", status: "closed" },
  { title: "Reduce retry amplification after outage", labels: ["incident", "reliability"], summary: "Current retry timing overloads a recovering provider.", status: "closed" },
  { title: "Document payment timeout recovery", labels: ["documentation", "operations"], summary: "On-call needs clear timeout reconciliation steps.", status: "closed" },
  { title: "Improve local checkout setup", labels: ["developer-experience"], summary: "New contributors struggle to run dependent services locally.", status: "closed" },
  { title: "Publish checkout architecture guide", labels: ["documentation", "architecture"], summary: "Service ownership and data flow need a maintained overview.", status: "closed" },
];

const commitActions = [
  "add domain types",
  "implement primary flow",
  "handle edge cases",
  "add observability",
  "add integration coverage",
  "update documentation",
  "address review feedback",
];

/** Produces stable timestamps over a 200-day simulated delivery history. */
function timestampForCommit(index: number): string {
  return new Date(Date.UTC(2025, 0, 6 + index * 2, 9 + (index % 8))).toISOString();
}

function getDefinitionForCommit(commitNumber: number): PullRequestDefinition {
  const definition = pullRequestDefinitions.find(
    (candidate) =>
      commitNumber >= candidate.start && commitNumber <= candidate.end,
  );

  if (!definition) {
    throw new Error(`No pull request definition for commit ${commitNumber}.`);
  }

  return definition;
}

const commits: MockCommit[] = Array.from({ length: 100 }, (_, index) => {
  const commitNumber = index + 1;
  const definition = getDefinitionForCommit(commitNumber);
  const commitPosition = commitNumber - definition.start;
  const relatedIssueNumbers = [
    301 + pullRequestDefinitions.indexOf(definition) * 2,
    302 + pullRequestDefinitions.indexOf(definition) * 2,
  ];

  return {
    id: `c${String(commitNumber).padStart(4, "0")}`,
    message: `${definition.scope}: ${commitActions[commitPosition % commitActions.length]}`,
    authoredAt: timestampForCommit(index),
    author: definition.author,
    files: [
      definition.files[commitPosition % definition.files.length],
      ...(commitPosition % 3 === 0
        ? [definition.files[(commitPosition + 1) % definition.files.length]]
        : []),
    ],
    parentIds: index === 0 ? [] : [`c${String(index).padStart(4, "0")}`],
    pullRequestNumber: definition.number,
    issueNumbers: relatedIssueNumbers,
  };
});

const pullRequests: MockPullRequest[] = pullRequestDefinitions.map(
  (definition, index) => {
    const includedCommits = commits.slice(definition.start - 1, definition.end);

    return {
      number: definition.number,
      title: definition.title,
      author: definition.author,
      status: "merged",
      createdAt: timestampForCommit(definition.start - 2),
      mergedAt: includedCommits.at(-1)?.authoredAt,
      commitIds: includedCommits.map((commit) => commit.id),
      summary: definition.summary,
      issueNumbers: [301 + index * 2, 302 + index * 2],
    };
  },
);

const issues: MockIssue[] = issueDefinitions.map((definition, index) => {
  const pullRequest = pullRequests[Math.floor(index / 2)];
  const relatedCommits = pullRequest.commitIds;

  return {
    number: 301 + index,
    title: definition.title,
    status: definition.status,
    createdAt: timestampForCommit(
      pullRequestDefinitions[Math.floor(index / 2)].start - 2,
    ),
    labels: definition.labels,
    summary: definition.summary,
    pullRequestNumber: pullRequest.number,
    relatedCommitIds: [relatedCommits[0], relatedCommits.at(-1)!],
  };
});

const fileHistories: MockFileHistory[] = Array.from(
  new Set(pullRequestDefinitions.flatMap((definition) => definition.files)),
).map((path) => {
  const fileCommits = commits.filter((commit) => commit.files.includes(path));

  return {
    path,
    commitIds: fileCommits.map((commit) => commit.id),
    firstChangedAt: fileCommits[0].authoredAt,
    lastChangedAt: fileCommits.at(-1)!.authoredAt,
    contributors: Array.from(new Set(fileCommits.map((commit) => commit.author))),
  };
});

const documentation: MockDocumentation[] = [
  { path: "README.md", title: "Checkout Service Overview", updatedAt: pullRequests[14].mergedAt, summary: "Service ownership, local setup, and checkout request flow." },
  { path: "docs/architecture/checkout-flow.md", title: "Checkout Flow Architecture", updatedAt: pullRequests[14].mergedAt, summary: "Validation, reservation, payment, and confirmation data flow." },
  { path: "docs/adr/004-inventory-reservation.md", title: "Reserve Inventory Before Payment", updatedAt: pullRequests[2].mergedAt, summary: "Decision record for reserving stock before capture." },
  { path: "docs/runbooks/payment-timeouts.md", title: "Payment Timeout Recovery", updatedAt: pullRequests[13].mergedAt, summary: "Investigation and reconciliation process for delayed payment confirmations." },
  { path: "docs/runbooks/job-recovery.md", title: "Job Recovery", updatedAt: pullRequests[8].mergedAt, summary: "Dead-letter queue inspection and controlled replay steps." },
  { path: "docs/runbooks/reconciliation.md", title: "Daily Reconciliation", updatedAt: pullRequests[12].mergedAt, summary: "Settlement and ledger reconciliation workflow." },
  { path: "docs/development/local-checkout.md", title: "Local Checkout Development", updatedAt: pullRequests[14].mergedAt, summary: "Local dependencies, fixtures, and diagnostics." },
];

/** A deterministic engineering project fixture with linked repository history. */
export const mockEngineeringRepositoryData: MockRepositoryData = {
  repository: "acme/checkout-service",
  ref: "main",
  filePath: "src/checkout/validation.ts",
  contributors,
  commits,
  pullRequests,
  issues,
  documentation,
  fileHistories,
  timeline: pullRequests.map((pullRequest) => ({
    id: `event-pr-${pullRequest.number}`,
    occurredAt: pullRequest.mergedAt,
    summary: `${pullRequest.title} merged.`,
    evidenceIds: [
      `pr-${pullRequest.number}`,
      pullRequest.commitIds.at(-1)!,
      ...(pullRequest.issueNumbers ?? []).map((issueNumber) => `issue-${issueNumber}`),
    ],
  })),
};

/** Backwards-friendly short name for the default repository fixture. */
export const mockRepositoryData = mockEngineeringRepositoryData;
