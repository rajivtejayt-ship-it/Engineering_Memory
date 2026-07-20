import { EngineeringMemoryAgent } from "@/lib/agent";
import { mockEngineeringRepositoryData } from "@/lib/context";
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

const agent = new EngineeringMemoryAgent();

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
    value.filePath.trim().length > 0 &&
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
    value.answer !== value.summary
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
    (value.confidence === undefined || typeof value.confidence === "string") &&
    (value.suggestedNextQuestions === undefined ||
      (Array.isArray(value.suggestedNextQuestions) &&
        value.suggestedNextQuestions.every(isString)))
  );
}

/** Validates an evidence item included in an API response. */
function isEvidenceItem(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.source === "string" &&
    typeof value.content === "string" &&
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
      (Array.isArray(value.evidenceIds) && value.evidenceIds.every(isString)))
  );
}

/** Type guard used for string-array response fields. */
function isString(value: unknown): value is string {
  return typeof value === "string";
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

/**
 * Answers an Engineering Memory question using temporary mock repository data.
 * Repository retrieval can replace this mock-data mapping in a future revision.
 */
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
      ...mockEngineeringRepositoryData,
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
