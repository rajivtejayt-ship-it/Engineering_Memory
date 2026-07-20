import {
  RepositoryApiAdapter,
  type RepositoryAdapter,
} from "@/lib/adapters/repository-adapter";
import { classifyQuestion, type QuestionClassification } from "@/lib/classifier";
import type { QuestionType } from "@/lib/constants";
import { buildContextPackage } from "@/lib/context";
import {
  createAIResponse,
  formatGeminiResponse,
  type FormattedResponse,
} from "@/lib/formatter";
import { generateGeminiResponse } from "@/lib/gemini/client";
import {
  createEvidenceRetriever,
  type RepositoryDataSource,
} from "@/lib/retriever";
import { GitHubRepositoryDataSource } from "@/lib/retriever/github-data-source";
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
  /** Converts backend repository payloads into the shared context contract. */
  repositoryAdapter: RepositoryAdapter;
  /** Retrieves API-normalized repository evidence for a repository context. */
  repositoryDataSource: RepositoryDataSource;
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
 * Compatibility facade for callers that prefer a single agent entry point.
 * It accepts backend repository payloads and delegates all work to Core.
 */
export class EngineeringMemoryAgent {
  private readonly dependencies: EngineeringMemoryAgentDependencies;
  private readonly usesLegacyPromptBuilders: boolean;

  constructor(dependencies: Partial<EngineeringMemoryAgentDependencies> = {}) {
    this.dependencies = {
      classifier: classifyQuestion,
      repositoryAdapter: new RepositoryApiAdapter(),
      repositoryDataSource: new GitHubRepositoryDataSource(),
      promptBuilders: defaultPromptBuilders,
      geminiClient: generateGeminiResponse,
      responseFormatter: formatGeminiResponse,
      ...dependencies,
    };
    this.usesLegacyPromptBuilders = dependencies.promptBuilders !== undefined;
  }

  /** Answers a question from a backend-owned repository payload. */
  async answer(
    question: Question,
    repositoryResponse: unknown,
  ): Promise<AIResponse> {
    const core = new EngineeringMemoryCore({
      classifier: this.dependencies.classifier,
      repositoryAdapter: this.dependencies.repositoryAdapter,
      retriever: createEvidenceRetriever(this.dependencies.repositoryDataSource),
      contextBuilder: buildContextPackage,
      promptBuilder: this.usesLegacyPromptBuilders
        ? (questionType, contextPackage, questionText) =>
            this.dependencies.promptBuilders[questionType](
              questionText,
              contextPackage.repositoryContext,
            )
        : buildGeminiPrompt,
      geminiClient: this.dependencies.geminiClient,
      responseFormatter: (rawOutput) =>
        createAIResponse(this.dependencies.responseFormatter(rawOutput)),
    });

    return core.answerFromBackend(question, repositoryResponse);
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
