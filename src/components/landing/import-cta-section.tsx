'use client';

import * as React from 'react';
import { CommandInput } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, GitGraph } from 'lucide-react';

export function ImportCtaSection() {
  const [url, setUrl] = React.useState('');

  return (
    <section className="py-32 bg-[var(--bg-base)]">
      <div className="mx-auto w-full max-w-4xl px-6 md:px-12 flex flex-col items-center text-center">
        
        <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text)]">
          <GitGraph size={32} />
        </div>
        
        <h2 className="text-[var(--text-display)] font-bold text-[var(--text)] tracking-tight mb-4">
          Begin the Investigation
        </h2>
        <p className="text-[var(--text-body)] text-[var(--text-secondary)] mb-12 max-w-2xl">
          Point Engineering Memory at any public GitHub repository to instantly reconstruct its historical intent graph.
        </p>

        <div className="w-full max-w-2xl relative shadow-2xl rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)] to-[var(--accent)] blur-[60px] opacity-10 rounded-full" />
          
          <div className="relative flex items-center bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl overflow-hidden p-1 focus-within:ring-2 focus-within:ring-[var(--accent)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--bg-base)] transition-all">
            <CommandInput 
              placeholder="https://github.com/owner/repository" 
              className="h-14 border-none shadow-none focus-visible:ring-0 flex-1 text-base bg-transparent px-4"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button size="lg" className="h-12 px-6 ml-2 shrink-0">
              Analyze <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
}
