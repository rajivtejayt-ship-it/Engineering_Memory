"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { AIResponse } from "@/lib/types";
import { WorkspaceShell } from "../components/workspace-shell";
import styles from "./codelore.module.css";

const suggestedQuestions = [
  "Why was authentication introduced?",
  "What breaks if retry.ts is removed?",
  "Why was middleware changed?",
];

export default function CodelorePage() {
  const router = useRouter();
  const [question, setQuestion] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("question") ?? "";
  });
  const [repositoryId, setRepositoryId] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.sessionStorage.getItem("engineering-memory:selected-repository") ?? "";
  });
  const [filePath, setFilePath] = useState("");
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const investigate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!question.trim() || !repositoryId.trim()) {
      setError("Choose a repository first. Import a public repository or connect GitHub for a private one.");
      return;
    }

    setIsInvestigating(true);
    setError(null);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repositoryId: repositoryId.trim(), filePath: filePath.trim(), question: question.trim() }),
      });
      const payload: unknown = await response.json();

      if (!response.ok || !isAskSuccessResponse(payload)) {
        throw new Error(getRequestError(payload));
      }

      window.sessionStorage.setItem("engineering-memory:last-analysis", JSON.stringify({
        question: question.trim(), repositoryId: repositoryId.trim(), filePath: filePath.trim(), response: payload.data,
      }));
      router.push("/investigation");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to begin this investigation.");
      setIsInvestigating(false);
    }
  };

  return <WorkspaceShell eyebrow="Codelore / repository inquiry" title="Ask the history"><div className={styles.scope}>
    <section className="codelore-intro"><p className="section-kicker">The evidence-led question space</p><h2>Ask what the code remembers.</h2><p>Codelore traces repository decisions instead of improvising an answer. Start with a question; inspect the evidence that supports it.</p></section>
    <section className="codelore-layout">
      <form className="codelore-composer" onSubmit={investigate}>
        <div className="composer-topline"><span>λ</span><p>New investigation</p><small>Evidence-first reasoning</small></div>
        <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Why was authentication introduced?" aria-label="Question for Codelore" rows={4} />
        <div className="codelore-context">
          <label><span>Repository</span><input value={repositoryId} onChange={(event) => setRepositoryId(event.target.value)} placeholder="Import or select a repository first" /></label>
          <label><span>File path <small>optional</small></span><input value={filePath} onChange={(event) => setFilePath(event.target.value)} placeholder="src/auth.ts" /></label>
        </div>
        <footer><p><i /> Public GitHub repository history</p><button type="submit" disabled={isInvestigating}>{isInvestigating ? "Tracing history…" : "Investigate →"}</button></footer>
        {error && <p className="codelore-error" role="alert">{error}</p>}
      </form>
      <aside className="codelore-aside"><p className="section-kicker">Good starting points</p><h3>Follow a decision, not a file.</h3>{suggestedQuestions.map((suggestion, index) => <button type="button" key={suggestion} onClick={() => setQuestion(suggestion)}><span>{String(index + 1).padStart(2, "0")}</span>{suggestion}<b>↗</b></button>)}<div className="codelore-tip"><span>Tip</span><p>Specific questions earn better evidence. Include a file, behavior, or historical event when you can.</p></div></aside>
    </section>
  </div></WorkspaceShell>;
}

function isAskSuccessResponse(value: unknown): value is { data: AIResponse } {
  return typeof value === "object" && value !== null && "data" in value && typeof (value as { data?: unknown }).data === "object" && (value as { data?: unknown }).data !== null;
}

function getRequestError(value: unknown): string {
  if (typeof value === "object" && value !== null && "error" in value) {
    const error = (value as { error?: { message?: unknown } }).error;
    if (typeof error?.message === "string") return error.message;
  }
  return "Unable to begin this investigation.";
}
