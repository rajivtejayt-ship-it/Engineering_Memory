/// <reference types="node" />

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/interactions";

/** Error returned when Gemini cannot generate a response. */
export class GeminiApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "GeminiApiError";
  }
}

interface GeminiInteractionResponse {
  output_text?: string;
}

/**
 * Sends a prompt to Gemini and returns the generated text.
 *
 * Configure `GEMINI_API_KEY` to authenticate and optionally `GEMINI_MODEL`
 * to select a model. The default model is `gemini-3.5-flash`.
 */
export async function generateGeminiResponse(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new GeminiApiError("GEMINI_API_KEY is not configured.");
  }

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        model: process.env.GEMINI_MODEL ?? "gemini-3.5-flash",
        input: prompt,
      }),
    });

    if (!response.ok) {
      throw new GeminiApiError(
        `Gemini API request failed with status ${response.status}.`,
        response.status,
      );
    }

    const data = (await response.json()) as GeminiInteractionResponse;

    if (!data.output_text) {
      throw new GeminiApiError("Gemini API returned no text response.");
    }

    return data.output_text;
  } catch (error) {
    if (error instanceof GeminiApiError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Unknown request error.";
    throw new GeminiApiError(`Unable to reach the Gemini API: ${message}`);
  }
}
