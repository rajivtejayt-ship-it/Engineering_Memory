'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  X, Sparkles, GitMerge, ArrowUpRight, FileCode2, AlertTriangle,
  GitCommit, BookOpen, Clock, Star
} from 'lucide-react';
import { defaultIconProps } from '@/design-system/icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';
import { MOCK_AI_CONTEXT_BY_TOPIC } from '@/mock-data/ai-knowledge-base';

export interface ContextPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
  activeContext?: typeof MOCK_AI_CONTEXT_BY_TOPIC['default'] | null;
}

const DEFAULT_CONTEXT = MOCK_AI_CONTEXT_BY_TOPIC['default'];

const REFERENCED_FILES = [
  { path: 'src/middleware/auth.ts', risk: 'high', changes: 24 },
  { path: 'src/core/auth/strategy.ts', risk: 'medium', changes: 18 },
  { path: 'src/core/payment/processor.ts', risk: 'medium', changes: 8 },
  { path: 'package.json', risk: 'low', changes: 31 },
];

const TIMELINE_EVENTS = [
  { date: 'Nov 2023', label: 'JWT Auth Migration', type: 'decision' },
  { date: 'Dec 2023', label: 'Turbopack Upgrade', type: 'release' },
  { date: 'Jan 2024', label: 'GraphQL Layer Added', type: 'pr' },
  { date: 'Feb 2024', label: 'Bug Fixes & Docs', type: 'commit' },
];

const RISK_COLORS: Record<string, string> = {
  high: 'text-[var(--danger)] bg-[var(--danger)]/10 border-[var(--danger)]/20',
  medium: 'text-[var(--warning)] bg-[var(--warning)]/10 border-[var(--warning)]/20',
  low: 'text-[var(--success)] bg-[var(--success)]/10 border-[var(--success)]/20',
};

export function ContextPanel({ className, onClose, activeContext, ...props }: ContextPanelProps) {
  const [tab, setTab] = React.useState<string>('context');
  const ctx = activeContext ?? DEFAULT_CONTEXT;

  return (
    <div
      className={cn(
        'flex h-full w-72 lg:w-80 flex-col border-l border-[var(--border)] bg-[var(--bg-panel)] flex-shrink-0',
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 bg-[var(--bg-card)] flex-shrink-0 h-[57px]">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[var(--accent)]" />
          <h3 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">Synthesis Lens</h3>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
            <X size={14} {...defaultIconProps} />
          </Button>
        )}
      </div>

      {/* Confidence Badge */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 text-[var(--accent)] text-xs font-semibold px-2.5 py-1.5 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-lg">
          <Sparkles size={11} /> AI Analysis
        </div>
        <div className="text-xs font-mono text-[var(--text-secondary)]">
          Confidence: <span className="text-[var(--success)] font-bold">{ctx.confidence}%</span>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="flex flex-col flex-1 min-h-0">
        <div className="px-4 pb-3 flex-shrink-0">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="context" className="text-xs">Context</TabsTrigger>
            <TabsTrigger value="files" className="text-xs">Files</TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          {/* Context Tab */}
          <TabsContent value="context" className="mt-0 px-4 pb-4 space-y-4 outline-none">
            <MarkdownRenderer content={ctx.markdown} />

            <div className="pt-2 border-t border-[var(--border)]">
              <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-2">Linked PRs</h4>
              <div className="space-y-1.5">
                {ctx.relatedPrs.map(pr => (
                  <div key={pr} className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] group hover:border-[var(--accent)]/40 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2">
                      <GitMerge size={13} className="text-[#8957e5]" />
                      <span className="text-xs font-mono text-[var(--text)]">{pr}</span>
                    </div>
                    <ArrowUpRight size={12} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)]" />
                  </div>
                ))}
              </div>
            </div>

            {ctx.relatedIssues.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-2">Linked Issues</h4>
                <div className="space-y-1.5">
                  {ctx.relatedIssues.map(issue => (
                    <div key={issue} className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] group hover:border-[var(--accent)]/40 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={13} className="text-[var(--warning)]" />
                        <span className="text-xs font-mono text-[var(--text)]">{issue}</span>
                      </div>
                      <ArrowUpRight size={12} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)]" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="mt-0 px-4 pb-4 outline-none">
            <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-3">Referenced Files</h4>
            <div className="space-y-2">
              {REFERENCED_FILES.map((file) => (
                <div
                  key={file.path}
                  className="p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] hover:border-[var(--border-hover)] transition-colors cursor-pointer group"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <FileCode2 size={13} className="text-[var(--text-secondary)] mt-0.5 flex-shrink-0" />
                    <span className="text-xs font-mono text-[var(--text)] break-all leading-tight">{file.path}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                      <GitCommit size={11} />
                      <span>{file.changes} changes</span>
                    </div>
                    <span className={cn(
                      'text-xs font-semibold px-2 py-0.5 rounded border uppercase tracking-wide',
                      RISK_COLORS[file.risk]
                    )}>
                      {file.risk}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="mt-0 px-4 pb-4 outline-none">
            <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-3">Engineering Timeline</h4>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-[var(--border)]" />

              <div className="space-y-4">
                {TIMELINE_EVENTS.map((event, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={cn(
                      'h-5 w-5 rounded-full border-2 flex-shrink-0 mt-0.5 relative z-10',
                      event.type === 'decision' && 'border-[var(--accent)] bg-[var(--accent)]/20',
                      event.type === 'release' && 'border-[var(--success)] bg-[var(--success)]/20',
                      event.type === 'pr' && 'border-[#8957e5] bg-[#8957e5]/20',
                      event.type === 'commit' && 'border-[var(--border-hover)] bg-[var(--bg-card)]',
                    )} />
                    <div>
                      <p className="text-xs font-medium text-[var(--text)] leading-tight">{event.label}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5 flex items-center gap-1">
                        <Clock size={10} /> {event.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
