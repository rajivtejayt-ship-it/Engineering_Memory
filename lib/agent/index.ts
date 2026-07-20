import type { QuestionType } from "@/lib/constants";
import type { QuestionClassification } from "@/lib/classifier";
import {
  buildContextPackage,
  buildRepositoryContext,
  type MockRepositoryData,
} from "@/lib/context";
import {
  createAIResponse,
  formatGeminiResponse,
  type FormattedResponse,
} from "@/lib/formatter";
import { generateGeminiResponse } from "@/lib/gemini/client";
import { classifyQuestion } from "@/lib/classifier";
import { createEvidenceRetriever } from "@/lib/retriever";
import type { AIResponse, Question, RepositoryContext } from "@/lib/types";

import {
  buildBreakageAnalysisPrompt,
  buildGeminiPrompt,
  buildRelevanceAnalysisPrompt,
  buildUnknownPrompt,
  buildWhyChangedPrompt,
  buildWhyIntroducedPrompt,
} from "@/lib/prompts";
import { EngineeringMemoryCore } from "./core";

/** Legacy prompt-builder signature retained for existing integrations. */
export type PromptBuilder = (
  question: string,
  repositoryContext: RepositoryContext,
) => string;

/** Dependencies retained for compatibility with EngineeringMemoryAgent callers. */
export interface EngineeringMemoryAgentDependencies {
  /** Categorizes the user's question. */
  classifier: (question: string) => QuestionClassification;
  /** Creates repository context from caller-supplied mock repository data. */
  contextBuilder: (repositoryData: MockRepositoryData) => RepositoryContext;
  /** Optional legacy prompt builders, used only when explicitly injected. */
  promptBuilders: Record<QuestionType, PromptBuilder>;
  /** Sends a completed prompt to Gemini. */
  geminiClient: (prompt: string) => Promise<string>;
  /** Converts Gemini Markdown into the legacy structured formatter shape. */
  responseFormatter: (rawOutput: string) => FormattedResponse;
}

const defaultPromptBuilders: Record<QuestionType, PromptBuilder> = {
  WHY_INTRODUCED: buildWhyIntroducedPrompt,
  WHY_CHANGED: buildWhyChangedPrompt,
  BREAKAGE: buildBreakageAnalysisPrompt,
  RELEVANCE: buildRelevanceAnalysisPrompt,
  UNKNOWN: buildUnknownPrompt,
};

/**
 * Compatibility adapter for the former agent API. New code should construct
 * EngineeringMemoryCore directly with its dedicated module dependencies.
 */
export class EngineeringMemoryAgent {
  private readonly dependencies: EngineeringMemoryAgentDependencies;
  private readonly usesLegacyPromptBuilders: boolean;

  constructor(dependencies: Partial<EngineeringMemoryAgentDependencies> = {}) {
    this.dependencies = {
      classifier: classifyQuestion,
      contextBuilder: buildRepositoryContext,
      promptBuilders: defaultPromptBuilders,
      geminiClient: generateGeminiResponse,
      responseFormatter: formatGeminiResponse,
      ...dependencies,
    };
    this.usesLegacyPromptBuilders = dependencies.promptBuilders !== undefined;
  }

  /** Answers a question using caller-supplied mock repository data. */
  async answer(
    question: Question,
    repositoryData: MockRepositoryData,
  ): Promise<AIResponse> {
    const repositoryContext = this.dependencies.contextBuilder(repositoryData);
    const core = new EngineeringMemoryCore({
      classifier: this.dependencies.classifier,
      retriever: createEvidenceRetriever({
        getRepositoryData: async () => repositoryData,
      }),
      contextBuilder: buildContextPackage,
      promptBuilder: this.usesLegacyPromptBuilders
        ? (questionType) =>
            this.dependencies.promptBuilders[questionType](
              question.text,
              repositoryContext,
            )
        : buildGeminiPrompt,
      geminiClient: this.dependencies.geminiClient,
      responseFormatter: (rawOutput) =>
        createAIResponse(this.dependencies.responseFormatter(rawOutput)),
    });

    return core.answer(question, repositoryContext);
  }
}

export {
  buildBreakageAnalysisPrompt,
  buildRelevanceAnalysisPrompt,
  buildUnknownPrompt,
  buildWhyChangedPrompt,
  buildWhyIntroducedPrompt,
};
export { createAIResponse } from "@/lib/formatter";
export {
  EngineeringMemoryCore,
  type EngineeringMemoryCoreDependencies,
} from "./core";
