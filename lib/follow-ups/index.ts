import type { RetrievalResult } from "@/lib/retriever";
import type { Question } from "@/lib/types";

/**
 * Generates exactly three evidence-seeking follow-up questions. This is
 * deterministic and does not call Gemini.
 */
export function generateSuggestedFollowUpQuestions(
  question: Question,
  retrievalResult: RetrievalResult,
): string[] {
  const target = getTarget(question, retrievalResult);

  switch (retrievalResult.questionType) {
    case "WHY_INTRODUCED":
      return [
        `What problem did ${target} solve when it was introduced?`,
        `Who introduced ${target}, and which commit, issue, or pull request records that decision?`,
        `What broke or improved after ${target} was introduced?`,
      ];
    case "WHY_CHANGED":
      return [
        `What problem or trade-off caused ${target} to change?`,
        `Who made the change to ${target}, and which commit or pull request explains it?`,
        `What broke or improved after ${target} changed?`,
      ];
    case "BREAKAGE":
      return [
        `Which files or services are most likely to break if ${target} changes or is removed?`,
        `When was the most recent regression involving ${target}, and what caused it?`,
        `Who owns ${target}, and which historical fix is most relevant to the risk?`,
      ];
    case "RELEVANCE":
      return [
        `Which files, services, or workflows still depend on ${target}?`,
        `What would break if ${target} were removed today?`,
        `Who last changed ${target}, and does recent history show that it is still relevant?`,
      ];
    default:
      return [
        `Who introduced or most recently changed ${target}?`,
        `What problem was ${target} intended to solve?`,
        `Is ${target} still relevant, and what would break if it were removed?`,
      ];
  }
}

function getTarget(question: Question, retrievalResult: RetrievalResult): string {
  if (retrievalResult.repositoryContext.filePath) {
    return "`" + retrievalResult.repositoryContext.filePath + "`";
  }

  const filePathMatch = question.text.match(
    /\b[\w./-]+\.(?:ts|tsx|js|jsx|json|md|yml|yaml|css|scss|sql)\b/i,
  );
  if (filePathMatch) {
    return "`" + filePathMatch[0] + "`";
  }

  return "this code";
}
