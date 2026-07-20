import { EngineeringMemoryAgent } from "@/lib/agent";
import { createProductionRepositoryDataSource } from "@/lib/context/repository-data-source";
import { GeminiApiError } from "@/lib/gemini/client";
import type { AIResponse, Question } from "@/lib/types";

interface AskRequestBody {
  repositoryId: string;
  filePath: string;
  question: string;
}

interface AskSuccessResponse {
  requestId: string;
  data: AIResponse;
  meta: {
    durationMs: number;
  };
}

interface AskErrorResponse {
  requestId: string;
  error: {
    code: string;
    message: string;
  };
  meta: {
    durationMs: number;
  };
}

const agent = new EngineeringMemoryAgent({
  repositoryDataSource: createProductionRepositoryDataSource(),
});

/** Returns whether a value is a plain object suitable for runtime validation. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** Validates the JSON body accepted by the ask endpoint. */
function isAskRequestBody(value: unknown): value is AskRequestBody {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.repositoryId === "string" &&
    value.repositoryId.trim().length > 0 &&
    typeof value.filePath === "string" &&
    typeof value.question === "string" &&
    value.question.trim().length > 0
  );
}

/** Validates that the agent returned the public response contract. */
function isAIResponse(value: unknown): value is AIResponse {
  if (
    !isRecord(value) ||
    typeof value.summary !== "string" ||
    typeof value.answer !== "string" ||
    value.answer !== value.summary ||
    !isExplainabilityMetadata(value.metadata) ||
    !isExplainabilityInfo(value.explainability)
  ) {
    return false;
  }

  if (
    value.evidence !== undefined &&
    (!Array.isArray(value.evidence) || !value.evidence.every(isEvidenceItem))
  ) {
    return false;
  }

  if (
    value.timeline !== undefined &&
    (!Array.isArray(value.timeline) || !value.timeline.every(isTimelineEvent))
  ) {
    return false;
  }

  return (
    (value.risks === undefined ||
      (Array.isArray(value.risks) && value.risks.every(isString))) &&
    (value.confidence === undefined ||
      isConfidenceAssessment(value.confidence)) &&
    (value.sources === undefined ||
      (Array.isArray(value.sources) && value.sources.every(isSourceAttribution))) &&
    (value.suggestedNextQuestions === undefined ||
      (Array.isArray(value.suggestedNextQuestions) &&
        value.suggestedNextQuestions.every(isString)))
  );
}

/** Validates the frontend-ready evidence and reasoning details. */
function isExplainabilityInfo(value: unknown): boolean {
  return (
    isRecord(value) &&
    isRecord(value.evidenceUsed) &&
    typeof value.evidenceUsed.total === "number" &&
    value.evidenceUsed.total >= 0 &&
    isStringArray(value.evidenceUsed.commitIds) &&
    isNumberArray(value.evidenceUsed.pullRequestNumbers) &&
    isNumberArray(value.evidenceUsed.issueNumbers) &&
    isStringArray(value.evidenceUsed.documentationPaths) &&
    typeof value.timelineLength === "number" &&
    value.timelineLength >= 0 &&
    typeof value.promptSize === "number" &&
    value.promptSize >= 0 &&
    typeof value.retrievalTimeMs === "number" &&
    value.retrievalTimeMs >= 0 &&
    typeof value.reasoningTimeMs === "number" &&
    value.reasoningTimeMs >= 0 &&
    isConfidenceAssessment(value.confidence) &&
    isReasoningQuality(value.reasoningQuality)
  );
}

function isReasoningQuality(value: unknown): boolean {
  return (
    isRecord(value) &&
    (value.level === "LOW" || value.level === "MEDIUM" || value.level === "HIGH") &&
    typeof value.explanation === "string"
  );
}

/** Validates debugging metadata included with every AI response. */
function isExplainabilityMetadata(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.retrievedEvidenceCount === "number" &&
    value.retrievedEvidenceCount >= 0 &&
    typeof value.confidence === "number" &&
    value.confidence >= 0 &&
    value.confidence <= 100 &&
    typeof value.retrievalTimeMs === "number" &&
    value.retrievalTimeMs >= 0 &&
    typeof value.reasoningTimeMs === "number" &&
    value.reasoningTimeMs >= 0 &&
    typeof value.promptSize === "number" &&
    value.promptSize >= 0
  );
}

/** Validates a deterministic 0–100 confidence assessment. */
function isConfidenceAssessment(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.score === "number" &&
    value.score >= 0 &&
    value.score <= 100 &&
    (value.level === "LOW" ||
      value.level === "MEDIUM" ||
      value.level === "HIGH") &&
    typeof value.explanation === "string"
  );
}

/** Validates an evidence item included in an API response. */
function isEvidenceItem(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.source === "string" &&
    typeof value.content === "string" &&
    (value.location === undefined || typeof value.location === "string") &&
    (value.sourceIds === undefined ||
      (Array.isArray(value.sourceIds) && value.sourceIds.every(isString)))
  );
}

/** Validates a repository source included for frontend attribution. */
function isSourceAttribution(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    (value.type === "commit" ||
      value.type === "pull-request" ||
      value.type === "issue") &&
    typeof value.summary === "string" &&
    (value.commitId === undefined || typeof value.commitId === "string") &&
    (value.pullRequestNumber === undefined ||
      typeof value.pullRequestNumber === "number") &&
    (value.issueNumber === undefined || typeof value.issueNumber === "number") &&
    (value.location === undefined || typeof value.location === "string")
  );
}

/** Validates a timeline event included in an API response. */
function isTimelineEvent(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.summary === "string" &&
    (value.occurredAt === undefined || typeof value.occurredAt === "string") &&
    (value.evidenceIds === undefined ||
      (Array.isArray(value.evidenceIds) && value.evidenceIds.every(isString))) &&
    (value.annotations === undefined ||
      (Array.isArray(value.annotations) && value.annotations.every(isString)))
  );
}

/** Type guard used for string-array response fields. */
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number");
}

/** Converts a start timestamp to a rounded execution duration. */
function getDurationMs(startedAt: number): number {
  return Date.now() - startedAt;
}

/** Returns a consistent structured error response. */
function errorResponse(
  requestId: string,
  startedAt: number,
  status: number,
  code: string,
  message: string,
): Response {
  const body: AskErrorResponse = {
    requestId,
    error: { code, message },
    meta: { durationMs: getDurationMs(startedAt) },
  };

  return Response.json(body, { status });
}

/** Maps Gemini client failures to safe HTTP status and error-code values. */
function getErrorDetails(error: unknown): {
  status: number;
  code: string;
  message: string;
} {
  if (!(error instanceof GeminiApiError)) {
    const message = error instanceof Error ? error.message : "";

    if (message.startsWith("GitHub ")) {
      return {
        status: 502,
        code: "REPOSITORY_UNAVAILABLE",
        message: "Repository history could not be fetched. Check that the repository is public and exists.",
      };
    }

    return {
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Unable to answer the question.",
    };
  }

  if (
    error.status === undefined &&
    error.message.includes("GEMINI_API_KEY is not configured")
  ) {
    return {
      status: 500,
      code: "GEMINI_CONFIGURATION_ERROR",
      message: "The AI service is not configured.",
    };
  }

  if (error.status === 408 || error.status === 504) {
    return {
      status: 504,
      code: "GEMINI_TIMEOUT",
      message: "The AI service did not respond in time.",
    };
  }

  return {
    status: 502,
    code: "GEMINI_REQUEST_FAILED",
    message: "The AI service could not complete the request.",
  };
}

/** Answers an Engineering Memory question from backend repository context. */
export async function POST(request: Request): Promise<Response> {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();

  console.info("Engineering Memory request received.", { requestId });

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    console.warn("Engineering Memory request rejected: invalid JSON.", {
      requestId,
      durationMs: getDurationMs(startedAt),
    });
    return errorResponse(
      requestId,
      startedAt,
      400,
      "INVALID_JSON",
      "Request body must contain valid JSON.",
    );
  }

  if (!isAskRequestBody(body)) {
    console.warn("Engineering Memory request rejected: invalid payload.", {
      requestId,
      durationMs: getDurationMs(startedAt),
    });
    return errorResponse(
      requestId,
      startedAt,
      400,
      "INVALID_REQUEST",
      "repositoryId, filePath, and question must be non-empty string values.",
    );
  }

  console.info("Engineering Memory request validated.", {
    requestId,
    repositoryId: body.repositoryId,
    filePath: body.filePath,
  });

  const question: Question = {
    id: requestId,
    text: body.question.trim(),
  };

  try {
    const response = await agent.answer(question, {
      repository: body.repositoryId.trim(),
      filePath: body.filePath.trim(),
    });

    if (!isAIResponse(response)) {
      console.error("Engineering Memory response failed validation.", {
        requestId,
        durationMs: getDurationMs(startedAt),
      });
      return errorResponse(
        requestId,
        startedAt,
        502,
        "INVALID_AGENT_RESPONSE",
        "The AI service returned an invalid response.",
      );
    }

    const result: AskSuccessResponse = {
      requestId,
      data: response,
      meta: { durationMs: getDurationMs(startedAt) },
    };

    console.info("Engineering Memory request completed.", {
      requestId,
      durationMs: result.meta.durationMs,
    });
    return Response.json(result);
  } catch (error) {
    const details = getErrorDetails(error);

    console.error("Engineering Memory request failed.", {
      requestId,
      durationMs: getDurationMs(startedAt),
      code: details.code,
    });
    return errorResponse(
      requestId,
      startedAt,
      details.status,
      details.code,
      details.message,
    );
  }
}
