'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/feedback/badge';
import { History, GitMerge, Search, ShieldAlert } from 'lucide-react';
import { defaultIconProps } from '@/design-system/icons';

const features = [
  {
    title: 'Repository Archaeology',
    description: 'Instantly map the entire historical structure of a repository without reading thousands of scattered commit messages.',
    icon: History,
    demo: (
      <div className="flex flex-col gap-2 font-mono text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-2 bg-[var(--bg-card)] p-2 rounded border border-[var(--border)]">
          <span className="text-[var(--text-meta)]">src/utils/hash.ts</span>
          <div className="flex-1 border-t border-dashed border-[var(--border)] mx-2" />
          <span className="text-[var(--accent)]">4 refactors</span>
        </div>
        <div className="flex items-center gap-2 bg-[var(--bg-card)] p-2 rounded border border-[var(--border)]">
          <span className="text-[var(--text-meta)]">src/core/auth.ts</span>
          <div className="flex-1 border-t border-dashed border-[var(--border)] mx-2" />
          <span className="text-[var(--warning)]">High churn</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Decision Reconstruction',
    description: 'Connect undocumented code to the specific pull requests, Slack threads, and issues that caused it to be written.',
    icon: GitMerge,
    demo: (
      <div className="relative p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-sm">
        <div className="absolute -top-3 left-4 bg-[var(--bg-panel)] px-2 text-xs font-semibold text-[var(--text)] border border-[var(--border)] rounded">
          Why this exists
        </div>
        <p className="mt-2 text-[var(--text-secondary)]">
          &quot;Added due to memory leak reported in <span className="text-[var(--accent)] underline decoration-dashed">Issue #204</span>. Implemented via <span className="text-[var(--accent)] underline decoration-dashed">PR #211</span>.&quot;
        </p>
      </div>
    ),
  },
  {
    title: 'Semantic Context Search',
    description: 'Search for concepts, architectural decisions, and bug fixes rather than just exact string matches.',
    icon: Search,
    demo: (
      <div className="flex flex-col gap-3">
        <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded p-2 text-xs text-[var(--text)] font-medium flex items-center">
          <Search size={12} className="mr-2 text-[var(--text-secondary)]" /> &quot;Why did we switch to Postgres?&quot;
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded p-2 text-xs text-[var(--text-secondary)]">
          <Badge variant="success" className="mb-2 text-[10px] h-4">Match Found</Badge>
          <br />
          PR #45: Migration from MongoDB. Primary reason: Relational consistency requirements for billing.
        </div>
      </div>
    ),
  },
  {
    title: 'Risk Analysis',
    description: 'Understand the blast radius before refactoring. Identify hidden dependencies that static analysis tools miss.',
    icon: ShieldAlert,
    demo: (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between bg-[var(--danger)]/10 text-[var(--danger)] p-2 rounded border border-[var(--danger)]/20 text-xs font-semibold">
          <span>auth-middleware.ts</span>
          <span>Risk: High</span>
        </div>
        <div className="text-[10px] text-[var(--text-secondary)] mt-1 ml-1 border-l-2 border-[var(--border)] pl-2">
          Dependent on deprecated session store. Removing this affects 14 downstream modules.
        </div>
      </div>
    ),
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-[var(--bg-panel)] border-y border-[var(--border)]">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-12">
        
        <div className="mb-16">
          <h2 className="text-[var(--text-display)] font-bold text-[var(--text)] tracking-tight mb-4">
            Engineered for Understanding
          </h2>
          <p className="text-[var(--text-body)] text-[var(--text-secondary)] max-w-2xl">
            Engineering Memory does not just index code. It indexes human reasoning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, i) => (
            <Card key={i} variant="interactive" className="p-0 overflow-hidden flex flex-col md:flex-row h-full">
              
              <div className="p-8 flex-1 flex flex-col border-b md:border-b-0 md:border-r border-[var(--border)]">
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] mb-6">
                  <feature.icon size={20} {...defaultIconProps} />
                </div>
                <h3 className="text-[var(--text-title-lg)] font-bold text-[var(--text)] mb-3">{feature.title}</h3>
                <p className="text-[var(--text-body)] text-[var(--text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="p-8 flex-1 bg-[var(--bg-base)] flex flex-col justify-center">
                {feature.demo}
              </div>

            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
