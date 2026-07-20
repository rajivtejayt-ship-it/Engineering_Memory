import type { QuestionType } from "@/lib/constants";
import type { QuestionClassification } from "@/lib/classifier";
import {
  RepositoryApiAdapter,
  type RepositoryAdapter,
} from "@/lib/adapters/repository-adapter";
import { attachSourceAttribution } from "@/lib/attribution";
import { calculateEvidenceConfidence } from "@/lib/confidence";
import type { ContextPackage } from "@/lib/context";
import { generateExplainabilityInfo } from "@/lib/explainability";
import { generateSuggestedFollowUpQuestions } from "@/lib/follow-ups";
import type { EvidenceRetriever, RetrievalResult } from "@/lib/retriever";
import { generateTimelineFromRetrieval } from "@/lib/timeline";
import type {
  AIResponse,
  ConfidenceAssessment,
  Question,
  RepositoryContext,
} from "@/lib/types";

/** Injectable collaborators used by the Engineering Memory core orchestrator. */
export interface EngineeringMemoryCoreDependencies {
  /** Classifies a natural-language question into structured Engineering Memory metadata. */
  classifier: (question: string) => QuestionClassification;
  /** Retrieves ranked repository evidence for a context and question type. */
  retriever: EvidenceRetriever;
  /** Converts backend repository payloads into the shared RepositoryContext. */
  repositoryAdapter?: RepositoryAdapter;
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
  /** Scores confidence from retrieved evidence rather than model self-assessment. */
  confidenceScorer?: (
    retrievalResult: RetrievalResult,
  ) => ConfidenceAssessment;
  /** Reconstructs a source-backed engineering timeline from retrieved evidence. */
  timelineGenerator?: (retrievalResult: RetrievalResult) => AIResponse["timeline"];
  /** Produces deterministic evidence-seeking follow-up questions. */
  followUpQuestionGenerator?: (
    question: Question,
    retrievalResult: RetrievalResult,
  ) => string[];
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

  /** Adapts a backend repository payload without coupling Core to its provider. */
  adaptRepositoryContext(repositoryResponse: unknown): RepositoryContext {
    return (
      this.dependencies.repositoryAdapter ?? new RepositoryApiAdapter()
    ).toRepositoryContext(repositoryResponse);
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

  /** Delegates deterministic confidence scoring to the configured scorer. */
  scoreConfidence(retrievalResult: RetrievalResult): ConfidenceAssessment {
    return (this.dependencies.confidenceScorer ?? calculateEvidenceConfidence)(
      retrievalResult,
    );
  }

  /** Delegates source-backed timeline reconstruction to the configured generator. */
  generateTimeline(retrievalResult: RetrievalResult): AIResponse["timeline"] {
    return (this.dependencies.timelineGenerator ?? generateTimelineFromRetrieval)(
      retrievalResult,
    );
  }

  /** Delegates generation of exactly three evidence-seeking follow-up questions. */
  generateFollowUpQuestions(
    question: Question,
    retrievalResult: RetrievalResult,
  ): string[] {
    return (
      this.dependencies.followUpQuestionGenerator ??
      generateSuggestedFollowUpQuestions
    )(question, retrievalResult);
  }

  /** Runs the complete Engineering Memory pipeline for a question. */
  async answer(
    question: Question,
    repositoryContext: RepositoryContext,
  ): Promise<AIResponse> {
    const classification = this.classifyQuestion(question.text);
    const questionType = classification.intent;
    const retrievalStartedAt = Date.now();
    const retrievalResult = await this.retrieveEvidenceForQuestion(
      repositoryContext,
      questionType,
      question.text,
    );
    const retrievalTimeMs = Date.now() - retrievalStartedAt;
    const reasoningStartedAt = Date.now();
    const contextPackage = this.buildContext(retrievalResult);
    const prompt = this.buildPrompt(questionType, contextPackage, question.text);
    const rawOutput = await this.callGemini(prompt);

    const response = attachSourceAttribution(
      {
        ...this.formatResponse(rawOutput),
        timeline: this.generateTimeline(retrievalResult),
      },
      retrievalResult,
    );
    const confidence = this.scoreConfidence(retrievalResult);
    const reasoningTimeMs = Date.now() - reasoningStartedAt;
    const explainability = generateExplainabilityInfo({
      retrievalResult,
      timeline: response.timeline ?? [],
      promptSize: prompt.length,
      retrievalTimeMs,
      reasoningTimeMs,
      confidence,
    });

    return {
      ...response,
      confidence,
      suggestedNextQuestions: this.generateFollowUpQuestions(
        question,
        retrievalResult,
      ),
      explainability,
      metadata: {
        retrievedEvidenceCount: getRetrievedEvidenceCount(retrievalResult),
        confidence: confidence.score,
        retrievalTimeMs,
        reasoningTimeMs,
        promptSize: prompt.length,
      },
    };
  }

  /**
   * Uses the production retriever's internal question-aware capability when
   * available, while retaining compatibility with injected public retrievers.
   */
  private retrieveEvidenceForQuestion(
    repositoryContext: RepositoryContext,
    questionType: QuestionType,
    questionText: string,
  ): Promise<RetrievalResult> {
    const retriever = this.dependencies.retriever as EvidenceRetriever &
      Partial<QuestionAwareEvidenceRetriever>;

    return retriever.retrieveEvidenceForQuestion
      ? retriever.retrieveEvidenceForQuestion(
          repositoryContext,
          questionType,
          questionText,
        )
      : retriever.retrieveEvidence(repositoryContext, questionType);
  }

  /**
   * Runs the pipeline from a backend-owned repository payload. Existing callers
   * may continue using answer(question, repositoryContext) directly.
   */
  answerFromBackend(
    question: Question,
    repositoryResponse: unknown,
  ): Promise<AIResponse> {
    return this.answer(
      question,
      this.adaptRepositoryContext(repositoryResponse),
    );
  }
}

/** Internal optional capability supplied by the production evidence retriever. */
interface QuestionAwareEvidenceRetriever {
  retrieveEvidenceForQuestion(
    repositoryContext: RepositoryContext,
    questionType: QuestionType,
    questionText: string,
  ): Promise<RetrievalResult>;
}

/** Counts evidence records selected by the Retriever across all source types. */
function getRetrievedEvidenceCount(retrievalResult: RetrievalResult): number {
  return (
    retrievalResult.commits.length +
    retrievalResult.pullRequests.length +
    retrievalResult.issues.length +
    retrievalResult.documentation.length
  );
}
