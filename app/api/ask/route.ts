import { EngineeringMemoryAgent } from "@/lib/agent";
import type { Question } from "@/lib/types";

interface AskRequestBody {
  repositoryId: string;
  filePath: string;
  question: string;
}

const agent = new EngineeringMemoryAgent();

/** Validates the JSON body accepted by the ask endpoint. */
function isAskRequestBody(value: unknown): value is AskRequestBody {
  if (!value || typeof value !== "object") {
    return false;
  }

  const body = value as Record<string, unknown>;

  return (
    typeof body.repositoryId === "string" &&
    body.repositoryId.trim().length > 0 &&
    typeof body.filePath === "string" &&
    body.filePath.trim().length > 0 &&
    typeof body.question === "string" &&
    body.question.trim().length > 0
  );
}

/**
 * Answers an Engineering Memory question using temporary mock repository data.
 * Repository retrieval can replace this mock-data mapping in a future revision.
 */
export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Request body must contain valid JSON." },
      { status: 400 },
    );
  }

  if (!isAskRequestBody(body)) {
    return Response.json(
      {
        error:
          "repositoryId, filePath, and question must be non-empty string values.",
      },
      { status: 400 },
    );
  }

  const question: Question = {
    id: crypto.randomUUID(),
    text: body.question,
  };

  try {
    const response = await agent.answer(question, {
      repository: body.repositoryId,
      ref: "mock",
      filePath: body.filePath,
    });

    return Response.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to answer question.";

    return Response.json({ error: message }, { status: 500 });
  }
}
