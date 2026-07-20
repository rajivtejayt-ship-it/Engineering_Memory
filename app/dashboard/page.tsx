import Link from "next/link";
import { WorkspaceShell } from "../components/workspace-shell";
import styles from "./dashboard.module.css";

const activity = [
  ["Merged", "#298 Replace legacy session store", "Oct 24", "pull"],
  ["Issue opened", "#184 Session leakage after deploy", "Oct 19", "issue"],
  ["Refactor", "Retry boundaries clarified", "Nov 02", "refactor"],
];

const investigations = [
  ["Why was auth.ts introduced?", "12 sources · 92% confidence"],
  ["What breaks if logger.ts is removed?", "9 sources · 78% confidence"],
  ["Why was middleware changed?", "10 sources · 86% confidence"],
];

export default function DashboardPage() {
  return (
    <WorkspaceShell eyebrow="Acme platform / main branch" title="Repository dashboard">
      <main className={styles.page}>
        <section className={styles.overview} aria-labelledby="repository-overview">
          <div>
            <p className={styles.eyebrow}>Repository overview</p>
            <h2 id="repository-overview">Understand the context before the next change.</h2>
            <p className={styles.description}>Acme Platform is synchronized and ready to browse or investigate.</p>
          </div>
          <div className={styles.health} aria-label="Repository health: 87 out of 100">
            <strong>87</strong>
            <span><b>Healthy</b> +4 this month</span>
          </div>
        </section>

        <section className={styles.quickActions} aria-label="Primary actions">
          <Link href="/explorer" className={styles.action}>
            <span>01</span><div><strong>Browse repository</strong><p>Inspect files, history, and related engineering evidence.</p></div><b>→</b>
          </Link>
          <Link href="/codelore" className={`${styles.action} ${styles.primaryAction}`}>
            <span>02</span><div><strong>Investigate a decision</strong><p>Ask why a change exists, changed, or still matters.</p></div><b>→</b>
          </Link>
        </section>

        <section className={styles.grid}>
          <article className={styles.panel}>
            <header><div><p className={styles.eyebrow}>Recent activity</p><h3>What changed recently</h3></div><Link href="/explorer">View repository →</Link></header>
            <ol className={styles.activityList}>{activity.map(([kind, title, date, tone]) => <li key={title}><span className={styles[tone]} /><div><small>{kind}</small><strong>{title}</strong></div><time>{date}</time></li>)}</ol>
          </article>

          <article className={styles.panel}>
            <header><div><p className={styles.eyebrow}>Recent investigations</p><h3>Continue a decision thread</h3></div><Link href="/codelore">New investigation →</Link></header>
            <div className={styles.investigations}>{investigations.map(([question, meta]) => <Link href={`/codelore?question=${encodeURIComponent(question)}`} key={question}><span>↗</span><div><strong>{question}</strong><small>{meta}</small></div></Link>)}</div>
          </article>
        </section>

        <section className={styles.grid}>
          <article className={styles.panel}>
            <header><div><p className={styles.eyebrow}>Engineering insights</p><h3>Attention worth carrying forward</h3></div><Link href="/insights">All insights →</Link></header>
            <div className={styles.insightRows}><p><b>High churn</b><span>src/auth.ts changed 13 times in 30 days.</span></p><p><b>Documentation drift</b><span>session-v1.md conflicts with the edge-session model.</span></p><p><b>Missing context</b><span>logger.ts remains central without a linked decision record.</span></p></div>
          </article>

          <article className={`${styles.panel} ${styles.timelinePreview}`}>
            <p className={styles.eyebrow}>Timeline preview</p>
            <h3>Authentication boundary</h3>
            <p>One issue, one decision discussion, and a merged pull request explain the current session model.</p>
            <Link href="/explorer">Open engineering timeline →</Link>
          </article>
        </section>
      </main>
    </WorkspaceShell>
  );
}
