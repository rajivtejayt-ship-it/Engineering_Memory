import { classifyQuestion, type QuestionCategory } from "@/lib/classifier";
import {
  buildRepositoryContext,
  type MockRepositoryData,
} from "@/lib/context";
import {
  formatGeminiResponse,
  type FormattedResponse,
} from "@/lib/formatter";
import { generateGeminiResponse } from "@/lib/gemini/client";
import type { AIResponse, Question, RepositoryContext } from "@/lib/types";

import {
  buildBreakageAnalysisPrompt,
  buildRelevanceAnalysisPrompt,
  buildUnknownPrompt,
  buildWhyChangedPrompt,
  buildWhyIntroducedPrompt,
} from "./prompts";

/** Builds a Gemini prompt for a question and repository context. */
export type PromptBuilder = (
  question: string,
  repositoryContext: RepositoryContext,
) => string;

/** Injectable collaborators used by the Engineering Memory orchestrator. */
export interface EngineeringMemoryAgentDependencies {
  /** Categorizes the user's question. */
  classifier: (question: string) => QuestionCategory;
  /** Creates repository context from mock repository data. */
  contextBuilder: (repositoryData: MockRepositoryData) => RepositoryContext;
  /** Builds a prompt for each supported question category. */
  promptBuilders: Record<QuestionCategory, PromptBuilder>;
  /** Sends a completed prompt to Gemini. */
  geminiClient: (prompt: string) => Promise<string>;
  /** Converts Gemini's Markdown response into structured content. */
  responseFormatter: (rawOutput: string) => FormattedResponse;
}

const defaultPromptBuilders: Record<QuestionCategory, PromptBuilder> = {
  WHY_INTRODUCED: buildWhyIntroducedPrompt,
  WHY_CHANGED: buildWhyChangedPrompt,
  BREAKAGE: buildBreakageAnalysisPrompt,
  RELEVANCE: buildRelevanceAnalysisPrompt,
  UNKNOWN: buildUnknownPrompt,
};

/** Converts formatted Gemini content into the public agent response model. */
export function createAIResponse(formatted: FormattedResponse): AIResponse {
  const evidence = formatted.evidence.map((content, index) => ({
    id: `evidence-${index + 1}`,
    source: "Gemini response",
    content,
  }));

  const timeline = formatted.timeline.map((summary, index) => ({
    id: `timeline-${index + 1}`,
    summary,
  }));

  return {
    answer: formatted.summary,
    evidence,
    timeline,
    risks: formatted.risks,
    confidence: formatted.confidence,
  };
}

/**
 * Coordinates question classification, context construction, prompt creation,
 * Gemini generation, and response formatting. Repository data is supplied by
 * the caller; this class performs no repository retrieval itself.
 */
export class EngineeringMemoryAgent {
  private readonly dependencies: EngineeringMemoryAgentDependencies;

  constructor(dependencies: Partial<EngineeringMemoryAgentDependencies> = {}) {
    this.dependencies = {
      classifier: classifyQuestion,
      contextBuilder: buildRepositoryContext,
      promptBuilders: defaultPromptBuilders,
      geminiClient: generateGeminiResponse,
      responseFormatter: formatGeminiResponse,
      ...dependencies,
    };
  }

  /** Answers a question using caller-supplied mock repository data. */
  async answer(
    question: Question,
    repositoryData: MockRepositoryData,
  ): Promise<AIResponse> {
    const category = this.dependencies.classifier(question.text);
    const repositoryContext = this.dependencies.contextBuilder(repositoryData);
    const prompt = this.dependencies.promptBuilders[category](
      question.text,
      repositoryContext,
    );
    const rawOutput = await this.dependencies.geminiClient(prompt);
    const formattedResponse = this.dependencies.responseFormatter(rawOutput);

    return createAIResponse(formattedResponse);
  }
}

export {
  buildBreakageAnalysisPrompt,
  buildRelevanceAnalysisPrompt,
  buildUnknownPrompt,
  buildWhyChangedPrompt,
  buildWhyIntroducedPrompt,
} from "./prompts";
