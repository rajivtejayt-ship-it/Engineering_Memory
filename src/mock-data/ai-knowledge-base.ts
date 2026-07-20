export interface MockChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface SuggestedPrompt {
  id: string;
  label: string;
  prompt: string;
  category: 'overview' | 'architecture' | 'decisions' | 'risk' | 'history';
}

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: 'p1',
    label: 'Explain this project',
    prompt: 'Give me a complete overview of this repository — what it does, why it was built, and how it works.',
    category: 'overview',
  },
  {
    id: 'p2',
    label: 'Summarize architecture',
    prompt: 'Summarize the high-level system architecture and technology stack.',
    category: 'architecture',
  },
  {
    id: 'p3',
    label: 'Engineering decisions',
    prompt: 'Show me the major engineering decisions and architecture decision records (ADRs).',
    category: 'decisions',
  },
  {
    id: 'p4',
    label: 'Explain authentication',
    prompt: 'How does authentication work in this codebase? Walk me through the implementation.',
    category: 'architecture',
  },
  {
    id: 'p5',
    label: 'Find risky files',
    prompt: 'Which files have the highest change frequency and represent the most risk?',
    category: 'risk',
  },
  {
    id: 'p6',
    label: 'Commit history summary',
    prompt: 'Summarize the recent commit history and highlight the most significant changes.',
    category: 'history',
  },
  {
    id: 'p7',
    label: 'Repository structure',
    prompt: 'Explain how this repository is organized and what each folder contains.',
    category: 'overview',
  },
  {
    id: 'p8',
    label: 'Recent changes',
    prompt: 'What changed recently? What were the biggest changes in the last 30 days?',
    category: 'history',
  },
];

const OVERVIEW_RESPONSE = `# Engineering Memory — Project Overview

> AI-powered repository intelligence that reconstructs *why* your codebase was built the way it was.

## Table of Contents
- [Problem Statement](#problem)
- [What It Does](#what)
- [Architecture](#architecture)
- [Repository Structure](#structure)
- [Core Engineering Decisions](#decisions)
- [Commit History Summary](#commits)
- [Known Risks](#risks)
- [Future Work](#future)

---

## Problem Statement

Every engineering team faces the same challenge: **knowledge rot**. Over time, the *why* behind code is lost. Developers leave. Tickets get closed. Architecture decisions evaporate from institutional memory.

When a new engineer joins or an incident occurs, teams waste days answering questions like:
- *Why is this file 1,200 lines long?*
- *Why did we pick this library over that one?*
- *Who made this change and what problem were they solving?*

Engineering Memory solves this by treating your Git history as a structured knowledge base.

---

## What It Does

Engineering Memory ingests your repository and reconstructs:

- **Engineering Decisions** — Why architectural choices were made
- **Change Patterns** — Which files change together and which are high-risk
- **Commit Intent** — The business reason behind each commit, not just the diff
- **Timeline Reconstruction** — A visual, chronological story of the codebase's evolution
- **Risk Surface Analysis** — Files with high churn, missing tests, or complex ownership

---

## Architecture

The system is built as a modern Next.js 16 application with the following layers:

| Layer | Technology | Purpose |
| --- | --- | --- |
| Frontend | Next.js 16, React 19, Turbopack | UI and Application Shell |
| Styling | Tailwind CSS + CSS Variables | Design System Tokens |
| Animation | Framer Motion | Interactions & Streaming |
| Component System | Radix UI Primitives | Accessible, headless UI |
| Data Layer | Mock Data (demo) | Repository Intelligence |

### Key Architectural Decisions

**App Router with Route Groups**
The application uses Next.js App Router with two route groups:
- \`(marketing)\` — Public pages (Landing, Login)
- \`(app)\` — Authenticated workspace (Welcome, Dashboard, Settings)

**Context-Driven State**
Application state is managed through three React Contexts:
- \`AppProvider\` — Authentication and repository metadata
- \`RepositoryProvider\` — Active repository and timeline selection
- \`ThemeProvider\` — Persistent dark/light/system theme

---

## Repository Structure

\`\`\`
src/
├── app/
│   ├── (app)/          # Authenticated Routes
│   │   ├── dashboard/  # AI Chat Workspace ← You are here
│   │   ├── welcome/    # Onboarding Bridge
│   │   ├── import/     # Repository Import Flow
│   │   └── settings/   # User Preferences
│   └── (marketing)/    # Public Routes
│       ├── page.tsx    # Landing Page
│       └── login/      # Authentication
├── components/
│   ├── ai/             # Chat Interface Components
│   ├── layout/         # AppShell, Sidebar, TopNav
│   ├── ui/             # Reusable Primitives
│   └── providers/      # React Context Providers
├── mock-data/          # Demo Knowledge Base
└── types/              # TypeScript Interfaces
\`\`\`

---

## Core Engineering Decisions

### Decision 1: JWT over Session Cookies
**Date:** Nov 2023 | **Status:** Accepted

**Context:** The legacy Express-session system worked for the web app but failed completely for the React Native mobile clients — CORS restrictions and lack of native storage made it impossible to share sessions cross-platform.

**Decision:** Migrate to stateless JWTs with 15-minute expiry and refresh token rotation. Secrets managed via AWS KMS.

**Impact:** Enabled mobile app launch, reduced auth latency by 40%, improved security posture.

---

### Decision 2: GraphQL Adoption
**Date:** Aug 2023 | **Status:** Accepted

**Context:** REST endpoints were causing over-fetching on mobile. The mobile team needed granular queries without requesting new backend endpoints.

**Decision:** Introduce Apollo GraphQL layer over existing REST services (not a full rewrite). REST endpoints remain available for backwards compatibility.

**Impact:** Reduced mobile data transfer by 60%, eliminated round trips for complex views.

---

### Decision 3: Turbopack over Webpack
**Date:** Dec 2023 | **Status:** Accepted

**Context:** Webpack build times had grown to 45 seconds for hot reload. Developer productivity was suffering significantly.

**Decision:** Upgrade to Next.js 16 with Turbopack. Initial compilation is 4x faster, HMR is sub-200ms.

**Impact:** Estimated 15 minutes saved per developer per day. Broadly adopted by the team.

---

## Commit History Summary

| Period | Commits | Primary Focus |
| --- | --- | --- |
| Nov 2023 | 47 | JWT Auth Migration |
| Dec 2023 | 31 | Turbopack upgrade, CI improvements |
| Jan 2024 | 58 | GraphQL adoption, mobile API layer |
| Feb 2024 | 22 | Bug fixes, monitoring, documentation |

**Most active files:**
- \`src/middleware/auth.ts\` — 24 changes across 8 PRs
- \`src/core/auth/strategy.ts\` — 18 changes
- \`package.json\` — 31 changes (dependency management)

---

## Known Risks

| File/Area | Risk Level | Reason |
| --- | --- | --- |
| \`src/middleware/auth.ts\` | 🔴 High | High churn, multiple authors, security-critical |
| \`src/core/payment/processor.ts\` | 🟠 Medium | Complex business logic, 3 open TODO comments |
| \`src/lib/data-pipeline/transform.ts\` | 🟠 Medium | No unit tests, single author (now departed) |
| \`src/api/graphql/resolvers.ts\` | 🟡 Low | Large file (900 LOC), could benefit from splitting |

---

## Future Work

- [ ] **Event Sourcing** — Track state changes as immutable events for better audit trails
- [ ] **AI-Powered Code Review** — Flag regressions against known engineering decisions
- [ ] **Slack Integration** — Surface engineering context directly in incident threads
- [ ] **Temporal Queries** — "What did this file look like 6 months ago and why did it change?"
- [ ] **Multi-repo Intelligence** — Cross-repository decision mapping for monorepos
`;

const ARCHITECTURE_RESPONSE = `# System Architecture Overview

## Technology Stack

| Layer | Technology | Version |
| --- | --- | --- |
| Runtime | Node.js | 20 LTS |
| Framework | Next.js (App Router) | 16.2 |
| Language | TypeScript | 5.4 |
| Bundler | Turbopack | Latest |
| Styling | Tailwind CSS | 4.0 |
| Animation | Framer Motion | 12 |
| UI Primitives | Radix UI | Latest |

## System Layers

### Presentation Layer
The frontend uses Next.js App Router with two route groups for clean separation between public (marketing) and authenticated (app) experiences.

### State Management
No external state library is used. Three React Contexts handle all application state:

- \`AppProvider\` — User auth, session, and repository metadata
- \`RepositoryProvider\` — Active repository, timeline selection, and AI context
- \`ThemeProvider\` — System-aware theme with localStorage persistence

### Design System
All visual decisions flow through CSS custom properties defined in \`globals.css\`. No hardcoded color values exist in components.

### Data Flow (Demo Mode)
\`\`\`
User Prompt
    ↓
useMockChat() Hook
    ↓
Simulated Streaming (Thinking → Generating → Streaming)
    ↓
Structured Markdown Response
    ↓
MarkdownRenderer Component
    ↓
Context Panel Update
\`\`\`

## Deployment Architecture
Currently configured for Vercel Edge Network deployment with static rendering for public pages and dynamic rendering for the authenticated workspace.
`;

const AUTH_RESPONSE = `# Authentication Architecture

## Current Implementation: JWT Bearer Tokens

The authentication system was migrated from Express Session to JWT in November 2023 (see **ADR-012**).

### Flow

\`\`\`
Client                    API Gateway              Auth Service
  |                           |                        |
  |-- POST /auth/login ------->|                        |
  |                           |-- validateCredentials ->|
  |                           |<-- { userId, roles } ---|
  |                           |-- signJWT() ----------->|
  |<-- { accessToken, refresh }|                        |
  |                           |                        |
  |-- GET /api/data ---------->|                        |
  |   Authorization: Bearer   |                        |
  |                           |-- verifyToken() ------->|
  |                           |<-- { payload } ---------|
  |<-- 200 { data } ----------|                        |
\`\`\`

### Token Configuration
- **Access Token Expiry:** 15 minutes
- **Refresh Token Expiry:** 7 days (rotated on use)
- **Algorithm:** RS256 (asymmetric)
- **Secret Management:** AWS KMS

### Key Files

| File | Responsibility |
| --- | --- |
| \`src/middleware/auth.ts\` | Token extraction, verification, and error handling |
| \`src/core/auth/strategy.ts\` | JWT sign/verify using jsonwebtoken |
| \`src/core/auth/utils.ts\` | Helper utilities (token parsing, expiry check) |

### Known Issue (Issue #402 — Resolved)
Sending a malformed \`Authorization\` header previously caused an uncaught exception and returned HTTP 500. Fixed in commit \`a8f92bd\` by wrapping the extraction in a try/catch and validating the \`Bearer \` prefix before splitting.
`;

const RISKS_RESPONSE = `# Risk Surface Analysis

## High Risk Files

### 🔴 \`src/middleware/auth.ts\`
**Risk Score: 92/100**

- 24 changes across 8 PRs in the last 90 days
- 4 different authors
- Security-critical path (every request passes through this)
- One unresolved TODO: \`// TODO: add rate limiting\`
- No integration tests (only unit tests)

**Recommendation:** Add rate limiting, increase test coverage to >90%, designate a single owner.

---

### 🟠 \`src/core/payment/processor.ts\`
**Risk Score: 68/100**

- Complex business logic with 3 open TODO comments
- Last major refactor was 8 months ago
- Only one developer has significant context (Sarah Chen, now on leave)
- No ADR documenting the payment flow design decisions

**Recommendation:** Pair programming session to distribute knowledge, document payment flow decisions.

---

### 🟠 \`src/lib/data-pipeline/transform.ts\`
**Risk Score: 61/100**

- Zero unit tests
- Single author: Mark Torres (departed Jan 2024)
- No documentation comments
- Critical to the data ingestion pipeline

**Recommendation:** Write tests before any changes. Schedule knowledge transfer session.

---

## Change Frequency Analysis

| File | Changes (90d) | Authors | Risk |
| --- | --- | --- | --- |
| \`src/middleware/auth.ts\` | 24 | 4 | 🔴 High |
| \`package.json\` | 31 | 6 | 🟡 Low |
| \`src/api/graphql/resolvers.ts\` | 19 | 3 | 🟠 Medium |
| \`src/core/payment/processor.ts\` | 8 | 1 | 🟠 Medium |
| \`src/lib/data-pipeline/transform.ts\` | 3 | 1 | 🟠 Medium |
`;

const REPO_STRUCTURE_RESPONSE = `# Repository Structure

## Top-Level Layout

\`\`\`
acme/platform/
├── src/
│   ├── api/            # GraphQL & REST API endpoints
│   ├── core/           # Business logic, domain models
│   ├── middleware/      # Auth, logging, rate limiting
│   ├── lib/            # Shared utilities, data pipeline
│   └── config/         # Environment configuration
├── tests/
│   ├── unit/           # Jest unit tests
│   ├── integration/    # Supertest integration tests
│   └── e2e/            # Playwright end-to-end tests
├── docs/
│   ├── adr/            # Architecture Decision Records
│   └── api/            # OpenAPI/GraphQL schema docs
├── infra/              # Terraform (links to acme/infra)
└── .github/workflows/  # CI/CD pipelines
\`\`\`

## Key Directories

### \`src/core/\` — Business Logic
Contains domain models and business rules. Organized by domain:
- \`auth/\` — Authentication strategy and user management
- \`payment/\` — Payment processing and subscription logic
- \`notification/\` — Email, push, and in-app notifications

### \`src/api/\` — API Layer
Two API styles coexist during the GraphQL migration:
- \`graphql/\` — Apollo Server schema, resolvers, and dataloaders
- \`rest/\` — Legacy REST endpoints (maintained for backwards compatibility)

### \`src/middleware/\` — Request Pipeline
Every HTTP request passes through this layer:
1. **Rate Limiting** — Redis-backed, per-IP and per-user
2. **Authentication** — JWT verification
3. **Logging** — Structured JSON logs via Pino
4. **Correlation IDs** — Request tracing for distributed debugging

### \`docs/adr/\` — Architecture Decision Records
12 ADRs document every major technical decision. Key ones:
- **ADR-008:** REST to GraphQL migration strategy
- **ADR-011:** Redis adoption for caching and rate limiting
- **ADR-012:** JWT migration from session cookies
- **ADR-014:** Turbopack adoption
`;

const COMMITS_RESPONSE = `# Commit History Summary

## Overview (Last 90 Days)

| Month | Commits | PRs Merged | Issues Closed |
| --- | --- | --- | --- |
| November 2023 | 47 | 12 | 28 |
| December 2023 | 31 | 9 | 15 |
| January 2024 | 58 | 16 | 34 |
| February 2024 | 22 | 7 | 11 |

## Most Significant Changes

### 🔐 JWT Authentication Migration (Nov 2023)
**PR #892 — 156 files changed**
The largest change in recent history. Replaced all Express-session usage with stateless JWT tokens across every service. Required coordinated deployment with a backward-compatible transition period.

### ⚡ Turbopack Upgrade (Dec 2023)
**PR #901 — Next.js 16 + Turbopack**
Reduced local development HMR from 45s to <200ms. Required updating several webpack-specific plugins and removing custom loader configurations.

### 📊 GraphQL API Layer (Jan 2024)
**PR #934, #935, #938**
Introduced Apollo GraphQL server. Three separate PRs over two weeks — schema design first, then resolvers, then client integration. REST endpoints preserved.

## Top Contributors (90 days)

| Contributor | Commits | PRs |
| --- | --- | --- |
| johndoe | 42 | 11 |
| sarah.chen | 38 | 9 |
| alex.torres | 31 | 8 |
| release-bot | 18 | — |

## Active Branches

| Branch | Last Commit | Author | Status |
| --- | --- | --- | --- |
| \`main\` | 2h ago | CI Bot | ✅ Passing |
| \`feature/rate-limiting\` | 1d ago | johndoe | 🟡 In Review |
| \`feature/webhook-events\` | 3d ago | sarah.chen | 🔵 Draft |
`;

const DECISIONS_RESPONSE = `# Engineering Decisions

## Architecture Decision Records (ADRs)

Engineering Memory has identified 12 major engineering decisions in this repository. Here are the most significant:

---

### ADR-012: JWT Authentication Migration
**Date:** November 2023 | **Status:** ✅ Accepted | **Author:** architecture-board

**Context:** Legacy Express-session cookies couldn't support mobile clients (CORS restrictions, native storage incompatibility).

**Decision:** Migrate to stateless JWTs (RS256) with 15-minute expiry and rotating refresh tokens. Secrets via AWS KMS.

**Consequences:**
- ✅ Mobile app launch enabled
- ✅ Auth latency reduced by 40%
- ⚠️ More complex token refresh logic required
- ⚠️ Token revocation requires blocklist (implemented via Redis)

---

### ADR-008: GraphQL Migration Strategy
**Date:** August 2023 | **Status:** ✅ Accepted | **Author:** platform-team

**Decision:** Introduce GraphQL as an additional API layer over existing REST. REST remains for backwards compatibility. Migrate incrementally — mobile-first.

**Why not a full rewrite?** Estimated 6-month rewrite risk was too high. Incremental migration allows the mobile team to adopt GraphQL without blocking the web team.

---

### ADR-011: Redis Adoption
**Date:** September 2023 | **Status:** ✅ Accepted

**Context:** JWT refresh token blocklisting required fast key-value lookups. Rate limiting also needed a shared store across instances.

**Decision:** Add Redis (AWS ElastiCache). One system solves both problems.

---

### ADR-014: Turbopack Migration
**Date:** December 2023 | **Status:** ✅ Accepted

**Context:** Webpack HMR was 45 seconds. With 12 engineers, this was 90+ minutes of waiting per engineer per day.

**Decision:** Upgrade to Next.js 16 with Turbopack. Breaking change: removed custom webpack plugins, migrated to Turbopack-compatible alternatives.

---

### ADR-007: Monorepo vs Polyrepo (Rejected Alternative)
**Date:** June 2023 | **Status:** ❌ Rejected

**Context:** Growing number of shared packages between web, mobile, and API made code sharing painful.

**Considered:** Full monorepo (Nx or Turborepo).

**Rejected because:** The mobile and infra teams had significantly different deployment cadences and toolchains. Organizational alignment was not ready.

**Current approach:** Shared packages published as private npm packages.
`;

const RECENT_CHANGES_RESPONSE = `# Recent Changes (Last 30 Days)

## Summary

The past 30 days have been focused on **stability and documentation** following the major GraphQL adoption in January 2024.

---

## Major Changes

### Rate Limiting Implementation (In Progress)
**Branch:** \`feature/rate-limiting\` | **Author:** johndoe | **Status:** In Review

Adding Redis-backed rate limiting to the auth endpoints. This directly addresses a known security gap identified in the recent penetration test.

\`\`\`
Endpoints being rate-limited:
- POST /auth/login — 5 attempts per minute per IP
- POST /auth/refresh — 10 attempts per minute per user
- POST /auth/register — 3 attempts per hour per IP
\`\`\`

---

### Bug Fixes
- Fixed memory leak in GraphQL dataloader when user sessions expired (#958)
- Fixed malformed error responses when payment webhook signature validation failed (#961)
- Fixed race condition in refresh token rotation under high concurrency (#964)

---

### Documentation Updates
- Added comprehensive OpenAPI documentation for all REST endpoints
- Wrote ADR-015 documenting the rate limiting decision
- Added CONTRIBUTING.md with local development setup guide

---

## Upcoming Releases

| Version | Target | Focus |
| --- | --- | --- |
| v2.5.0 | Mar 2024 | Rate limiting, webhook events |
| v2.6.0 | Apr 2024 | Performance improvements, caching layer |
`;

export const MOCK_AI_RESPONSES: Record<string, string> = {
  default: OVERVIEW_RESPONSE,
  overview: OVERVIEW_RESPONSE,
  architecture: ARCHITECTURE_RESPONSE,
  authentication: AUTH_RESPONSE,
  risks: RISKS_RESPONSE,
  structure: REPO_STRUCTURE_RESPONSE,
  commits: COMMITS_RESPONSE,
  decisions: DECISIONS_RESPONSE,
  recent: RECENT_CHANGES_RESPONSE,
};

export function getResponseForPrompt(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes('overview') || lower.includes('explain') || lower.includes('complete') || lower.includes('what does') || lower.includes('what is')) {
    return MOCK_AI_RESPONSES.overview;
  }
  if (lower.includes('architecture') || lower.includes('tech stack') || lower.includes('technology') || lower.includes('stack')) {
    return MOCK_AI_RESPONSES.architecture;
  }
  if (lower.includes('auth') || lower.includes('jwt') || lower.includes('login') || lower.includes('session')) {
    return MOCK_AI_RESPONSES.authentication;
  }
  if (lower.includes('risk') || lower.includes('risky') || lower.includes('danger') || lower.includes('vulnerability')) {
    return MOCK_AI_RESPONSES.risks;
  }
  if (lower.includes('structure') || lower.includes('organized') || lower.includes('folder') || lower.includes('directory')) {
    return MOCK_AI_RESPONSES.structure;
  }
  if (lower.includes('commit') || lower.includes('history') || lower.includes('git log') || lower.includes('changes')) {
    return MOCK_AI_RESPONSES.commits;
  }
  if (lower.includes('decision') || lower.includes('adr') || lower.includes('why did') || lower.includes('reason')) {
    return MOCK_AI_RESPONSES.decisions;
  }
  if (lower.includes('recent') || lower.includes('last') || lower.includes('latest') || lower.includes('new')) {
    return MOCK_AI_RESPONSES.recent;
  }

  return MOCK_AI_RESPONSES.default;
}

export const MOCK_AI_CONTEXT_BY_TOPIC: Record<string, { markdown: string; relatedPrs: string[]; relatedIssues: string[]; confidence: number }> = {
  default: {
    markdown: `## Repository: acme/platform\n\nThis is the core platform monorepo for Acme Inc. It contains the API, auth, payments, and data pipeline.\n\n**Language:** TypeScript\n**Stars:** 1,240\n**Last Commit:** 2 hours ago`,
    relatedPrs: ['#892 JWT Migration', '#934 GraphQL Layer', '#958 Memory Leak Fix'],
    relatedIssues: ['#402 Auth Crash Fix', '#411 Rate Limiting Request'],
    confidence: 94,
  },
  authentication: {
    markdown: `## Auth Module Analysis\n\nThe authentication system was migrated from Express-session to JWT in **ADR-012** (November 2023).\n\n**Risk Level:** 🔴 High\n**Recent changes:** 24 commits in 90 days\n**File:** \`src/middleware/auth.ts\``,
    relatedPrs: ['#892 JWT Migration', '#901 Token Refresh', '#964 Race Condition Fix'],
    relatedIssues: ['#402 Auth Crash Fix', '#388 Session Timeout Bug'],
    confidence: 97,
  },
  risks: {
    markdown: `## Risk Analysis\n\n**Total Risk Score: 72/100** (Medium-High)\n\nHighest risk files identified in the current codebase. Auth middleware and payment processor are the primary concerns.\n\n**Recommendation:** Increase test coverage, designate owners for critical files.`,
    relatedPrs: ['#892 JWT Security Fix', '#947 Payment Bug Fix'],
    relatedIssues: ['#402 Auth Crash', '#418 Payment Failure Edge Case'],
    confidence: 89,
  },
};
