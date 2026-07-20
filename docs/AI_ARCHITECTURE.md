# Engineering Memory AI Architecture

## Architecture

Engineering Memory is an evidence-first repository question-answering pipeline.
The `EngineeringMemoryCore` orchestrator delegates each stage to a dedicated,
injectable module; it contains no retrieval, prompt, or model business logic.

```text
POST /api/ask
  -> request validation, request ID, logging, timing
  -> EngineeringMemoryAgent backend adapter
       -> Repository Adapter
  -> EngineeringMemoryCore
       -> Question Classifier
       -> Evidence Retriever
       -> Context Builder
       -> Prompt Builder
       -> Gemini Client
       -> Response Formatter
  -> response validation and structured JSON
```

`EngineeringMemoryAgent` accepts a backend-owned repository payload, adapts it
to `RepositoryContext`, and retrieves evidence through an injected
`RepositoryDataSource`. `EngineeringMemoryCore.answer(question, context)`
remains available for callers that already own a normalized context.

## Folder Explanation

| Folder | Responsibility |
| --- | --- |
| `lib/agent` | Core orchestration and legacy adapter. |
| `lib/adapters` | Provider-neutral conversion from API payloads to AI context metadata. |
| `lib/attribution` | Frontend-ready commit, PR, and issue source attribution. |
| `lib/classifier` | Rule-based intent, confidence, target, and scope detection. |
| `lib/confidence` | Deterministic evidence-confidence scoring. |
| `lib/constants` | Typed question types, confidence thresholds, and prompt names. |
| `lib/context` | Mock repository contracts, compression, and bounded context-package construction. |
| `lib/follow-ups` | Deterministic evidence-seeking follow-up questions. |
| `lib/formatter` | Defensive Gemini Markdown parsing and `AIResponse` conversion. |
| `lib/gemini` | Independent Gemini API transport. |
| `lib/health` | Deterministic repository churn, staleness, and risk analysis. |
| `lib/prompts` | System, intent-specific templates, and final prompt construction. |
| `lib/retriever` | Provider-independent retrieval, ranking, and deduplication. |
| `lib/timeline` | Deterministic source-backed engineering timelines. |
| `lib/types` | Shared domain contracts. |
| `app/api/ask` | HTTP request and response boundary. |
| `tests/sample-questions.ts` | Reusable classifier and pipeline fixtures. |

`lib/agent/prompts.ts` is a compatibility re-export. New prompt code belongs in
`lib/prompts`.

## Module Responsibilities

### Classifier

`classifyQuestion(question)` is deterministic and does not call Gemini. It
returns the following shape:

```ts
interface QuestionClassification {
  intent: QuestionType;
  confidence: number;
  detectedTarget: string | null;
  scope: "file" | "component" | "repository" | "unknown";
}
```

The core uses `intent` for retrieval and prompt selection.

### Retriever

`retrieveEvidence(repositoryContext, questionType, repositoryData)` selects
and ranks commits, pull requests, issues, and documentation. Ranking uses file
matches, folder proximity, issue and PR links, recency, and modification
frequency; duplicate source records are merged before result limits are applied.
It never calls Gemini.

`createEvidenceRetriever(source)` accepts `RepositoryDataSource`, the boundary
for a future GitHub, database, or search-index implementation.

### Context Builder

`buildContextPackage(retrievalResult, options)` turns a `RetrievalResult` into
a compact `ContextPackage`. It removes duplicate source-scoped IDs, compresses
long fields, prioritizes issues, merged PRs, commits, and architecture decisions,
then orders retained evidence chronologically. The default evidence budget is
7.5 KB, leaving room for prompt formatting under the 10 KB target.

### Prompt Builder

`buildGeminiPrompt(questionType, contextPackage)` combines system
instructions, the user question, repository metadata, and bounded evidence
into one Gemini input.
The reusable templates are `system.ts`, `whyIntroduced.ts`, `whyChanged.ts`,
`breakage.ts`, and `relevance.ts`. They require evidence IDs, Markdown,
uncertainty disclosure, and confidence estimates.

### Gemini Client

`generateGeminiResponse(prompt)` is independent of Engineering Memory. It
uses `GEMINI_API_KEY`, supports `GEMINI_MODEL` selection, and returns
structured `GeminiApiError` values. Timeout and retry policy are intentionally
not implemented yet and should be added at the transport boundary before
production use.

| Environment variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Required Gemini credential. |
| `GEMINI_MODEL` | Optional model override; default is `gemini-3.5-flash`. |

### Formatter

`formatAIResponse(rawOutput)` parses Gemini Markdown into `AIResponse`. It
recognizes Markdown, bold, and simple plain-text headings. If the summary
heading is absent or the output is malformed, the raw text becomes the summary
instead of causing a parsing failure.

`AIResponse` contains `summary`, backward-compatible `answer`, attributed
evidence, a deterministic timeline, a 0–100 confidence assessment with an
explanation, source records, three
suggested follow-ups, and explainability metadata.

## Sequence Diagram

```mermaid
sequenceDiagram
    participant Client
    participant API as POST /api/ask
    participant Core as EngineeringMemoryCore
    participant Classifier
    participant Retriever
    participant Context
    participant Prompts
    participant Gemini
    participant Formatter

    Client->>API: repositoryId, filePath, question
    API->>API: validate; create request ID; start timer
    API->>Core: answer(question, repository context)
    Core->>Classifier: classifyQuestion(question.text)
    Classifier-->>Core: QuestionClassification
    Core->>Retriever: retrieveEvidence(context, intent)
    Retriever-->>Core: RetrievalResult
    Core->>Context: buildContext(result)
    Context-->>Core: ContextPackage
    Core->>Prompts: buildPrompt(intent, package)
    Prompts-->>Core: final prompt
    Core->>Gemini: callGemini(prompt)
    Gemini-->>Core: Markdown response
    Core->>Formatter: formatResponse(raw output)
    Formatter-->>Core: AIResponse
    Core-->>API: AIResponse
    API->>API: validate response; log duration
    API-->>Client: structured JSON
```

## API Documentation

### `POST /api/ask`

Request body:

```json
{
  "repositoryId": "acme/checkout-service",
  "filePath": "src/checkout/validation.ts",
  "question": "Why was validation.ts introduced?"
}
```

All fields are required, non-empty strings. The route creates a request ID,
omits question text from logs, measures execution time, and validates the
agent response before returning it.

Successful response:

```json
{
  "requestId": "uuid",
  "data": {
    "summary": "...",
    "answer": "...",
    "evidence": [],
    "timeline": [],
    "risks": [],
    "confidence": {
      "score": 72,
      "level": "MEDIUM",
      "explanation": "The change is supported by a merged PR and issue discussion, but file history is limited."
    },
    "sources": [],
    "suggestedNextQuestions": [],
    "metadata": {
      "retrievedEvidenceCount": 4,
      "confidence": 72,
      "retrievalTimeMs": 12,
      "reasoningTimeMs": 340,
      "promptSize": 6142
    }
  },
  "meta": { "durationMs": 123 }
}
```

Error response:

```json
{
  "requestId": "uuid",
  "error": { "code": "INVALID_REQUEST", "message": "..." },
  "meta": { "durationMs": 2 }
}
```

| Status | Error code | Meaning |
| --- | --- | --- |
| `400` | `INVALID_JSON` | Body is not valid JSON. |
| `400` | `INVALID_REQUEST` | Required request fields are invalid. |
| `500` | `GEMINI_CONFIGURATION_ERROR` | Gemini is not configured. |
| `500` | `INTERNAL_ERROR` | Unexpected application failure. |
| `502` | `GEMINI_REQUEST_FAILED` | Gemini or an upstream response failed. |
| `502` | `INVALID_AGENT_RESPONSE` | The agent response is invalid. |
| `504` | `GEMINI_TIMEOUT` | Gemini did not respond before timeout. |

## Extension Guide

### Add a real repository provider

1. Normalize API payloads with `RepositoryAdapter`.
2. Implement `RepositoryDataSource.getRepositoryData(repositoryContext)` and
   return `RepositoryEvidenceData`.
3. Build an `EvidenceRetriever` with `createEvidenceRetriever(source)`.
4. Inject the retriever into `EngineeringMemoryCore`.
5. Replace the API route's temporary mock-data mapping after adding provider
   authentication, pagination, and error handling.

### Add a question intent

1. Add a value to `QUESTION_TYPES`.
2. Add classifier keywords and patterns plus sample questions.
3. Add a focused template and map it in `SYSTEM_PROMPTS`.
4. Test ranking and prompt behavior with relevant repository evidence.
5. Test the full pipeline with relevant mock evidence.

### Change prompt-size limits

```ts
buildContextPackage(retrievalResult, {
  maxEvidenceItems: 10,
  maxCharacters: 4_000,
});
```

Keep the limit below the model's practical prompt budget and retain the
truncation notice so the model can express uncertainty correctly.

### Add an output field

1. Extend `AIResponse` in `lib/types`.
2. Add the Markdown heading to `system.ts` and `builder.ts`.
3. Parse and default the field in `lib/formatter`.
4. Update the API response guard in `app/api/ask/route.ts`.
5. Update this document's API example.

## Test Data and Operations

`mockEngineeringRepositoryData` simulates a linked checkout-service history:
100 commits, 15 pull requests, 30 issues, contributors, documentation,
timeline events, commit relationships, and derived file histories.

The fixture is test-only. The API route passes backend repository metadata
through `RepositoryAdapter`; an injected `RepositoryDataSource` supplies
real history when available. Missing history is valid and produces an
evidence-empty response with zero retrieved evidence.

- Keep `GEMINI_API_KEY` server-only; never expose it through `NEXT_PUBLIC_*`.
- Gemini logs intentionally exclude prompts and API keys.
- API logs similarly omit question text.
- Retrieval ranking selects likely evidence; it does not prove causation.
- Prompt templates require uncertainty when evidence is incomplete.
- Timeline, health, confidence, and follow-up modules are deterministic and do
  not call Gemini.
- `npm test` runs Core migration tests for adapter-backed empty and partial
  repository responses.
