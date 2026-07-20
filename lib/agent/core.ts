import type { QuestionType } from "@/lib/constants";
import type { QuestionClassification } from "@/lib/classifier";
import type { ContextPackage } from "@/lib/context";
import type { EvidenceRetriever, RetrievalResult } from "@/lib/retriever";
import type { AIResponse, Question, RepositoryContext } from "@/lib/types";

/** Injectable collaborators used by the Engineering Memory core orchestrator. */
export interface EngineeringMemoryCoreDependencies {
  /** Classifies a natural-language question into structured Engineering Memory metadata. */
  classifier: (question: string) => QuestionClassification;
  /** Retrieves ranked repository evidence for a context and question type. */
  retriever: EvidenceRetriever;
  /** Builds a bounded context package from retrieval output. */
  contextBuilder: (retrievalResult: RetrievalResult) => ContextPackage;
  /** Builds the final Gemini prompt from the question type and context package. */
  promptBuilder: (
    questionType: QuestionType,
    contextPackage: ContextPackage,
    question: string,
  ) => string;
  /** Sends a completed prompt to Gemini. */
  geminiClient: (prompt: string) => Promise<string>;
  /** Converts raw Gemini output into the public response model. */
  responseFormatter: (rawOutput: string) => AIResponse;
}

/**
 * Coordinates the Engineering Memory pipeline. Each step delegates to an
 * injected module so this class contains no retrieval, prompting, or model
 * business logic.
 */
export class EngineeringMemoryCore {
  constructor(
    private readonly dependencies: EngineeringMemoryCoreDependencies,
  ) {}

  /** Delegates question classification to the configured classifier module. */
  classifyQuestion(question: string): QuestionClassification {
    return this.dependencies.classifier(question);
  }

  /** Delegates evidence retrieval to the configured retriever module. */
  retrieveEvidence(
    repositoryContext: RepositoryContext,
    questionType: QuestionType,
  ): Promise<RetrievalResult> {
    return this.dependencies.retriever.retrieveEvidence(
      repositoryContext,
      questionType,
    );
  }

  /** Delegates context construction to the configured context-builder module. */
  buildContext(retrievalResult: RetrievalResult): ContextPackage {
    return this.dependencies.contextBuilder(retrievalResult);
  }

  /** Delegates final-prompt construction to the configured prompt-builder module. */
  buildPrompt(
    questionType: QuestionType,
    contextPackage: ContextPackage,
    question: string,
  ): string {
    return this.dependencies.promptBuilder(questionType, contextPackage, question);
  }

  /** Delegates model invocation to the configured Gemini client module. */
  callGemini(prompt: string): Promise<string> {
    return this.dependencies.geminiClient(prompt);
  }

  /** Delegates raw-output transformation to the configured formatter module. */
  formatResponse(rawOutput: string): AIResponse {
    return this.dependencies.responseFormatter(rawOutput);
  }

  /** Runs the complete Engineering Memory pipeline for a question. */
  async answer(
    question: Question,
    repositoryContext: RepositoryContext,
  ): Promise<AIResponse> {
    const classification = this.classifyQuestion(question.text);
    const questionType = classification.intent;
    const retrievalResult = await this.retrieveEvidence(
      repositoryContext,
      questionType,
    );
    const contextPackage = this.buildContext(retrievalResult);
    const prompt = this.buildPrompt(questionType, contextPackage, question.text);
    const rawOutput = await this.callGemini(prompt);

    return this.formatResponse(rawOutput);
  }
}
