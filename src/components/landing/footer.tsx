import * as React from 'react';
import { Hexagon, GitGraph } from 'lucide-react';
import { defaultIconProps } from '@/design-system/icons';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-panel)] py-12 text-[var(--text-meta)] text-[var(--text-secondary)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col md:flex-row justify-between px-6 md:px-12 gap-8 md:gap-0">
        
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 text-[var(--text)] font-semibold transition-opacity hover:opacity-80">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[var(--accent)]/10 text-[var(--accent)]">
              <Hexagon size={14} {...defaultIconProps} />
            </div>
            <span>Engineering Memory</span>
          </Link>
          <p className="max-w-xs">
            The Archaeology of Intent. Reconstruct the precise reasoning behind any repository.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--success)]"></span>
            </span>
            <span className="font-mono text-xs uppercase tracking-wider">All systems operational</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-[var(--text)] uppercase tracking-wider font-mono text-xs">Product</h4>
            <Link href="/import" className="hover:text-[var(--text)] transition-colors">Import Repository</Link>
            <Link href="/dashboard" className="hover:text-[var(--text)] transition-colors">Dashboard</Link>
          </div>
          
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-[var(--text)] uppercase tracking-wider font-mono text-xs">Community</h4>
            <Link href="https://github.com" target="_blank" className="hover:text-[var(--text)] transition-colors flex items-center gap-2 mt-2">
              <GitGraph size={14} /> Open Source
            </Link>
          </div>

        </div>
        
      </div>
      
      <div className="mx-auto w-full max-w-7xl px-6 md:px-12 mt-12 pt-8 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono">
        <p>&copy; {new Date().getFullYear()} Engineering Memory Project.</p>
        <p>Built with Next.js 16 & Turbopack.</p>
      </div>
    </footer>
  );
}
