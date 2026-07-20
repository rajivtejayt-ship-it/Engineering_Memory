"use client";

import Link from "next/link";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./workspace-shell.module.css";

type NavigationResult = {
  type: "Page";
  title: string;
  meta: string;
  href: string;
};

const navigation = [
  ["Dashboard", "/dashboard", "◫"],
  ["Repository", "/explorer", "⌘"],
  ["Investigate", "/codelore", "λ"],
] as const;

const results: NavigationResult[] = [
  { type: "Page", title: "Dashboard", meta: "Repository overview and next actions", href: "/dashboard" },
  { type: "Page", title: "Repository", meta: "Browse the current repository history", href: "/explorer" },
  { type: "Page", title: "Investigate", meta: "Ask an evidence-led engineering question", href: "/codelore" },
];

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const visibleResults = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    return normalizedQuery
      ? results.filter((result) => `${result.type} ${result.title} ${result.meta}`.toLowerCase().includes(normalizedQuery))
      : results;
  }, [query]);

  if (!open) return null;

  const choose = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="command-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="command-palette" role="dialog" aria-modal="true" aria-label="Global repository search" onMouseDown={(event) => event.stopPropagation()}>
        <div className="command-input-row"><span>⌕</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Navigate Engineering Memory…" /><kbd>Esc</kbd></div>
        <div className="command-hint"><span>{query ? "Matching destinations" : "Quick navigation"}</span><span>↵ open</span></div>
        <div className="command-results">
          {visibleResults.length ? visibleResults.map((result) => (
            <button className="command-result" type="button" key={`${result.type}-${result.title}`} onClick={() => choose(result.href)}>
              <span className={`result-type result-${result.type.replace(" ", "-").toLowerCase()}`}>{result.type.slice(0, 1)}</span>
              <span className="result-copy"><strong>{result.title}</strong><small>{result.meta}</small></span>
              <span className="result-kind">{result.type}</span>
            </button>
          )) : <p className="no-results">No destinations match “{query}”.</p>}
        </div>
        <footer className="command-footer"><span><kbd>⌘</kbd><kbd>K</kbd> quick navigation</span><span>Engineering Memory</span></footer>
      </section>
    </div>
  );
}

export function WorkspaceShell({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  const signOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  return (
    <main className={`${styles.shell} app-frame`}>
      <aside className="app-sidebar">
        <Link href="/dashboard" className="app-mark"><span /> <b>engineering</b> memory</Link>
        <button type="button" className="repo-switcher" onClick={() => router.push("/import")} aria-label="Import or switch repository"><span className="repo-avatar">A</span><span><strong>acme/platform</strong><small>Import or switch repository</small></span><i>→</i></button>
        <nav className="app-nav" aria-label="Workspace navigation">
          <p>Workspace</p>
          {navigation.map(([label, href, icon]) => <Link href={href} key={href} className={pathname === href ? "active" : ""}><span>{icon}</span>{label}</Link>)}
        </nav>
        <div className="sidebar-bottom"><button type="button" onClick={() => setSearchOpen(true)} className="sidebar-search"><span>⌕</span> Navigate <kbd>⌘ K</kbd></button><div className="index-status"><i /> Index current <small>1.4M artifacts</small></div><div className="profile-row"><span className="profile-avatar">H</span><span><strong>Harsha</strong><small>Personal workspace</small></span><button type="button" onClick={signOut}>Sign out</button></div></div>
      </aside>
      <section className="app-content">
        <header className="app-header"><div><p>{eyebrow}</p><h1>{title}</h1></div><div className="header-actions"><button className="global-search" onClick={() => setSearchOpen(true)} type="button"><span>⌕</span> Navigate <kbd>⌘ K</kbd></button><button className="new-investigation" type="button" onClick={() => router.push("/codelore")}>Investigate <span>λ</span></button></div></header>
        <div className="app-page">{children}</div>
      </section>
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </main>
  );
}
