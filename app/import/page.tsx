"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./import.module.css";

interface ImportResponse {
  message?: string;
}

export default function ImportPage() {
  const router = useRouter();
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const startImport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!repositoryUrl.trim()) return;

    setStatus("submitting");
    setMessage(null);
    try {
      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repositoryUrl: repositoryUrl.trim() }),
      });
      const payload = await readImportResponse(response);
      if (!response.ok) throw new Error(payload.message ?? "Repository import could not be started.");
      window.sessionStorage.setItem("engineering-memory:selected-repository", repositoryUrl.trim().replace(/^https:\/\/github\.com\//, "").split("/").slice(0, 2).join("/"));
      router.push("/dashboard");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Repository import could not be started.");
    }
  };

  return <main className={styles.page}>
    <header className={styles.header}><Link href="/" className={styles.mark}><span /> <b>engineering</b> memory</Link><Link href="/codelore">Try investigation →</Link></header>
    <section className={styles.content} aria-labelledby="import-title">
      <p>Step 1 of 1 · repository setup</p>
      <h1 id="import-title">Start Exploring Engineering Decisions.</h1>
      <span>Connect GitHub for repositories you can access, including private ones—or paste any public GitHub URL.</span>
      <a className={styles.github} href="/api/auth/github">Connect GitHub <small>Recommended · public and private repositories</small></a>
      <form onSubmit={startImport}>
        <label htmlFor="repository-url">Or paste a public GitHub repository URL</label>
        <input id="repository-url" type="url" autoComplete="url" placeholder="https://github.com/owner/repository" value={repositoryUrl} onChange={(event) => setRepositoryUrl(event.target.value)} disabled={status === "submitting"} required />
        <p>Public repositories need no sign-in. Private repositories require GitHub authentication.</p>
        <button type="submit" disabled={status === "submitting"}>{status === "submitting" ? "Preparing repository…" : "Import repository →"}</button>
        {status === "error" && <div className={styles.error} role="alert">{message}</div>}
      </form>
      <button className={styles.demo} type="button" onClick={() => setRepositoryUrl("https://github.com/vercel/next.js")}>Try demo repository</button>
      <aside><strong>What happens next</strong><ol><li>Verify the repository and default branch.</li><li>Queue the repository import.</li><li>Open the repository dashboard.</li></ol></aside>
    </section>
  </main>;
}

async function readImportResponse(response: Response): Promise<ImportResponse> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as ImportResponse;
  } catch {
    return { message: "The import service returned an unexpected response. Please try again." };
  }
}
