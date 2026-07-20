import Link from "next/link";
import styles from "./landing.module.css";

const proofPoints = [
  ["01", "Evidence first", "Every explanation begins with commits, pull requests, issues, and documentation."],
  ["02", "Decision trails", "Turn disconnected repository events into an ordered engineering story."],
  ["03", "Built for review", "Keep uncertainty, sources, risks, and confidence visible in every answer."],
];

export default function Home() {
  return (
    <main className={`${styles.scope} landing-shell`}>
      <div className="landing-orb landing-orb-one" aria-hidden="true" />
      <div className="landing-orb landing-orb-two" aria-hidden="true" />

      <header className="landing-nav">
        <Link className="landing-mark" href="/"><span /> <b>engineering</b> memory</Link>
        <nav aria-label="Product navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#proof">Why it matters</a>
        </nav>
        <a className="landing-login" href="/api/auth/github">Sign in with GitHub <span>→</span></a>
      </header>

      <section className="landing-hero">
        <div className="landing-copy">
          <p className="landing-kicker"><span /> The repository historian</p>
          <h1>Know the reason <em>before</em> you change the code.</h1>
          <p>Engineering Memory reconstructs the decisions behind a system—linking commits, pull requests, issues, and the conversations that shaped them.</p>
          <div className="landing-actions">
            <Link className="landing-primary" href="/import">Start with a repository <span>↗</span></Link>
            <a className="landing-secondary" href="#how-it-works">See how it works <span>↓</span></a>
          </div>
          <div className="landing-note"><span /> No code generation. Just the context your team already created.</div>
        </div>

        <div className="history-visual" aria-label="Example engineering decision trail">
          <div className="history-grid" />
          <span className="history-node node-file">auth.ts</span>
          <span className="history-node node-issue">#184</span>
          <span className="history-node node-pr">PR #298</span>
          <article className="history-card">
            <header><span /> Decision trail <b>92% supported</b></header>
            <ol>
              <li><i /> <div><small>ISSUE CREATED · OCT 19</small><strong>Session leakage after deploy</strong></div></li>
              <li><i /> <div><small>OPTIONS REVIEWED · OCT 20</small><strong>Isolation options compared</strong></div></li>
              <li><i /> <div><small>MERGED · OCT 24</small><strong>Signed edge sessions introduced</strong></div></li>
            </ol>
          </article>
          <p className="history-caption"><span /> 1,248 linked artifacts in memory</p>
        </div>
      </section>

      <section className="landing-proof" id="proof">
        {proofPoints.map(([number, title, description]) => <article key={number}><span>{number}</span><h2>{title}</h2><p>{description}</p></article>)}
      </section>

      <section className="landing-workflow" id="how-it-works">
        <div><p className="landing-kicker"><span /> A calmer way to investigate</p><h2>Questions belong in the history, not in another chat.</h2></div>
        <div className="workflow-steps"><p><b>Ask in Codelore</b> Describe the decision, risk, or change you need to understand.</p><p><b>Review the evidence</b> See exactly which source records support the explanation.</p><p><b>Move with confidence</b> Follow the timeline, risks, and suggested next questions.</p></div>
      </section>

      <footer className="landing-footer"><span><i /> Engineering Memory / repository intelligence</span><Link href="/import">Import a repository →</Link></footer>
    </main>
  );
}
