# Engineering Memory

Engineering Memory is a repository historian for software teams. It reconstructs **why code exists** by connecting public GitHub history—commits, pull requests, issues, and documentation—into an evidence-backed engineering investigation.

It is not a code generator or a generic chat interface. Ask a question about a repository decision and review the sources, timeline, risks, uncertainty, and follow-up questions behind the answer.

## The problem

Code explains *what* a system does. The reasons behind it are usually scattered across old commits, issue discussions, pull requests, and documents. That context is expensive to recover during a bug investigation, refactor, or onboarding.

Engineering Memory brings those records together so an engineer can understand the decision before changing the code.

## Features

- Public GitHub repository import and validation
- Evidence retrieval from commits, pull requests, and issues
- Rule-based question classification and deterministic evidence ranking
- Gemini-powered, evidence-first engineering investigations
- Structured reports with an executive summary, decision history, timeline, evidence, risks, confidence, and suggested follow-ups
- Repository dashboard, explorer, and investigation workspace
- Keyboard-accessible quick navigation with `⌘ K` / `Ctrl K`
- Clear loading, validation, and API error states for the primary flow

## Product flow

```mermaid
flowchart LR
  A[Landing] --> B[Import repository]
  B --> C[Repository dashboard]
  C --> D[Browse repository]
  C --> E[Investigate in Codelore]
  D --> E
  E --> F[Engineering investigation]
  F --> D
```

## Architecture

```mermaid
flowchart LR
  UI[Next.js frontend] --> ASK[POST /api/ask]
  UI --> IMPORT[POST /api/import]
  ASK --> CORE[Engineering Memory Core]
  CORE --> RETRIEVE[Repository adapter and retriever]
  RETRIEVE --> GITHUB[Public GitHub API]
  CORE --> PROMPT[Prompt builder]
  PROMPT --> GEMINI[Gemini API]
  GEMINI --> FORMAT[Response formatter]
  FORMAT --> UI
  IMPORT --> DB[(PostgreSQL via Prisma)]
```

## Technology stack

- Next.js 16 and React 19
- TypeScript
- Prisma and PostgreSQL for repository-import persistence
- Google Gemini for final evidence-grounded explanations
- Public GitHub REST API for live repository evidence
- Node test runner via `tsx` and ESLint

## Project structure

```text
app/                 Next.js routes, API handlers, and frontend components
  api/               ask and repository-import endpoints
  codelore/          investigation entry workspace
  investigation/     investigation report
  dashboard/         repository overview
  explorer/          repository history browser
lib/                 AI pipeline and repository-domain modules
  agent/             thin orchestration layer
  adapters/          backend/repository normalization boundary
  classifier/        rule-based question intent classification
  context/           context construction and compression
  formatter/         Gemini markdown to application response
  gemini/            reusable Gemini client
  prompts/           reusable prompt templates and builder
  retriever/         evidence ranking, deduplication, and retrieval
  types/             shared TypeScript contracts
prisma/              persistence schema
tests/               unit and integration-style tests
docs/                subsystem architecture documentation
```

## Installation

Prerequisites: Node.js 20+ and npm. PostgreSQL is needed only for the repository import endpoint.

```bash
git clone <your-repository-url>
cd Engineering_Memory
npm ci
cp .env.example .env.local
```

## Environment variables

Set these values in `.env.local`:

```bash
# Required for a completed AI investigation
GEMINI_API_KEY=your_gemini_api_key

# Optional; defaults to the client default when omitted
GEMINI_MODEL=gemini-2.0-flash

# Required to persist imports through POST /api/import
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/engineering_memory

# Required to connect GitHub and import private repositories
GITHUB_OAUTH_CLIENT_ID=your_github_oauth_client_id
GITHUB_OAUTH_CLIENT_SECRET=your_github_oauth_client_secret
```

The live investigation path can read public GitHub repositories without a GitHub token. Private repositories require the authenticated GitHub connection described below.

For GitHub OAuth, create a GitHub OAuth App and set its callback URL to `http://localhost:3000/api/auth/github/callback` in local development. The app requests `repo` access only to list and import repositories the signed-in user can access.

If you configure `DATABASE_URL`, create the local schema:

```bash
npx prisma db push
```

## Running locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The first screen directs you to import a repository or begin an investigation.

Useful checks:

```bash
npx tsc --noEmit
npm run lint
npm test
npm run build
```

## Importing a repository

1. Select **Import repository** on the landing page.
2. Paste a public GitHub URL, such as `https://github.com/vercel/next.js`.
3. Submit the form. The import endpoint validates the repository and queues the import.
4. Continue to the dashboard, then browse or investigate the repository.

The import flow requires `DATABASE_URL`. If it is not configured, the application returns a clear configuration error instead of pretending that the import succeeded.

## Using the application

### Start an investigation

1. Open **Investigate** from the sidebar or dashboard.
2. Enter a public repository as `owner/repository` and optionally a file path.
3. Ask an engineering-history question, for example: `Why was auth.ts introduced?`
4. Review the investigation report and use a suggested follow-up question to continue.

### Browse context

Use **Repository** to orient yourself in the current history and open a prefilled investigation. The dashboard is intentionally an overview; the investigation report is the place for a detailed answer.

### Quick navigation

Press `⌘ K` on macOS or `Ctrl K` on Windows/Linux to jump between Dashboard, Repository, and Investigate.

## Example investigation workflow

```text
Question: Why was auth.ts introduced?
  → Classify intent and target
  → Retrieve and rank relevant history
  → Compress context for the model
  → Generate an evidence-led explanation
  → Format the report with sources, a timeline, risks, and confidence
```

## AI subsystem

The AI subsystem is deliberately modular:

1. **Classifier** identifies the question intent without an LLM.
2. **Retriever** selects, ranks, and deduplicates relevant evidence.
3. **Context builder** orders and compresses evidence for the prompt budget.
4. **Prompt builder** asks Gemini to explain *why*, cite sources, and declare uncertainty.
5. **Formatter** converts structured markdown into the frontend response model.

See [AI architecture documentation](docs/AI_ARCHITECTURE.md) for the detailed module responsibilities and extension guide.

## Screenshots

Add current demo captures to `docs/screenshots/` before presenting externally. Recommended captures:

- Landing and repository import
- Codelore investigation entry
- Evidence-backed investigation report
- Repository dashboard and explorer

## Development workflow

1. Create a focused branch.
2. Make the smallest change that improves the product or evidence pipeline.
3. Run TypeScript, lint, test, and production-build checks.
4. Test the primary flow with a public repository and configured local environment.
5. Keep API contracts and shared types stable unless an intentional migration is documented.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| Investigation cannot run | Set `GEMINI_API_KEY` in `.env.local` and restart the dev server. |
| Import cannot start | Set `DATABASE_URL`, run `npx prisma db push`, and verify PostgreSQL is reachable. |
| Repository is unavailable | Use a valid public GitHub `owner/repository` or repository URL. |
| GitHub rate limiting | Wait for the limit to reset or add an authenticated GitHub integration. |
| Port already in use | Stop the existing process or run `npm run dev -- --port 3001`. |

## Roadmap

- Authenticated GitHub connections and private repository support
- Import progress and repository-index status
- Data-backed repository explorer and timeline views
- Team workspaces and saved investigations
- Deeper dependency and code-reference analysis

## License

No license has been selected yet. Add a `LICENSE` file before public distribution.

## Contributors

Built by Harsha and the Engineering Memory contributors.
