"use client";

import type { AIResponse } from "@/lib/types";
import { useRouter } from "next/navigation";
import { WorkspaceShell } from "../components/workspace-shell";

interface StoredAnalysis {
  question: string;
  repositoryId: string;
  filePath: string;
  response: AIResponse;
}

export default function InvestigationPage() {
  const analysis = readStoredAnalysis();

  return (
    <WorkspaceShell eyebrow="Investigation / live analysis" title="Engineering investigation">
      {analysis ? <AnalysisReport analysis={analysis} /> : <EmptyInvestigation />}
    </WorkspaceShell>
  );
}

function AnalysisReport({ analysis }: { analysis: StoredAnalysis }) {
  const router = useRouter();
  const { response } = analysis;
  const confidence = response.confidence ?? response.explainability.confidence;
  const timeline = response.timeline ?? [];
  const evidence = response.evidence ?? [];
  const risks = response.risks ?? [];
  const followUps = response.suggestedNextQuestions ?? [];

  return (
    <article className="investigation-report">
      <header className="report-hero">
        <div className="report-meta">
          <span>{analysis.repositoryId}</span>
          <span>{analysis.filePath}</span>
          <span>{response.metadata.retrievedEvidenceCount} sources retrieved</span>
        </div>
        <h2>{analysis.question}</h2>
        <p>Generated from the repository evidence currently available to Engineering Memory.</p>
        <div className="report-confidence">
          <span>{confidence.score}<small>%</small></span>
          <div>
            <strong>{confidence.level.toLowerCase()} confidence</strong>
            <p>{confidence.explanation}</p>
          </div>
        </div>
      </header>

      <section className="report-section executive-summary">
        <p className="section-kicker">Executive summary</p>
        <h3>{response.summary}</h3>
      </section>

      <section className="report-section">
        <p className="section-kicker">Engineering timeline</p>
        {timeline.length ? <div className="report-timeline">
          {timeline.map((event, index) => <div key={event.id}>
            <time>{formatDate(event.occurredAt)}</time>
            <span className={index % 2 ? "discussion" : ""} />
            <article>
              <small>{event.annotations?.join(" · ") || "Repository event"}</small>
              <strong>{event.summary}</strong>
            </article>
          </div>)}
        </div> : <p className="report-empty">No dated timeline events were available for this question.</p>}
      </section>

      <section className="report-section evidence-used">
        <div className="section-title-row"><p className="section-kicker">Evidence used</p><span>{evidence.length} evidence records</span></div>
        {evidence.length ? <div className="report-source-table">
          {evidence.map((item) => <div key={item.id}>
            <span className="source-kind">{item.source}</span>
            <strong>{item.location ?? item.id}</strong>
            <p>{item.content}</p>
            <b>{item.sourceIds?.length ?? 0}</b>
          </div>)}
        </div> : <p className="report-empty">The response did not include directly attributable evidence records.</p>}
      </section>

      <section className="report-section report-two-column final-section">
        <div>
          <p className="section-kicker">Risks and limitations</p>
          {risks.length ? risks.map((risk, index) => <div className="risk-callout" key={risk}><b>{String(index + 1).padStart(2, "0")}</b><p>{risk}</p></div>) : <p className="report-empty">No specific risks were returned for this investigation.</p>}
        </div>
        <div>
          <p className="section-kicker">Suggested next questions</p>
          {followUps.length ? followUps.map((question) => <button className="followup" type="button" key={question} onClick={() => router.push(`/codelore?question=${encodeURIComponent(question)}`)}>{question}<span>→</span></button>) : <p className="report-empty">No follow-up questions were returned.</p>}
        </div>
      </section>

      <section className="report-section report-explainability">
        <p className="section-kicker">Analysis details</p>
        <div className="report-source-table">
          <div><span className="source-kind">Evidence</span><strong>{response.explainability.evidenceUsed.total}</strong><p>retrieved repository records</p><b>✓</b></div>
          <div><span className="source-kind">Timeline</span><strong>{response.explainability.timelineLength}</strong><p>chronological events reconstructed</p><b>✓</b></div>
          <div><span className="source-kind">Reasoning</span><strong>{response.explainability.reasoningQuality.level}</strong><p>{response.explainability.reasoningQuality.explanation}</p><b>✓</b></div>
        </div>
      </section>
    </article>
  );
}

function EmptyInvestigation() {
  return <article className="investigation-report">
    <header className="report-hero">
      <p className="section-kicker">Ready for analysis</p>
      <h2>Ask a repository question to begin.</h2>
      <p>Use Investigate to ask a repository question. Your completed analysis will appear here with evidence, timeline, risks, and confidence.</p>
    </header>
  </article>;
}

function readStoredAnalysis(): StoredAnalysis | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem("engineering-memory:last-analysis");
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    return isStoredAnalysis(value) ? value : null;
  } catch {
    return null;
  }
}

function isStoredAnalysis(value: unknown): value is StoredAnalysis {
  if (typeof value !== "object" || value === null) return false;
  const analysis = value as Partial<StoredAnalysis>;
  return (
    typeof analysis.question === "string" &&
    typeof analysis.repositoryId === "string" &&
    typeof analysis.filePath === "string" &&
    typeof analysis.response === "object" &&
    analysis.response !== null &&
    typeof analysis.response.summary === "string"
  );
}

function formatDate(value: string | undefined): string {
  if (!value) return "Undated";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
