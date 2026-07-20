'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X, Sparkles, BookOpen, GitMerge, FileQuestion, ArrowUpRight } from 'lucide-react';
import { defaultIconProps } from '@/design-system/icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRepository } from '@/components/providers/repository-provider';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';

export interface ContextPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

export function ContextPanel({ className, onClose, ...props }: ContextPanelProps) {
  const { activeContext, activeContextTab, setActiveContextTab } = useRepository();

  return (
    <div 
      className={cn(
        'flex h-full w-80 lg:w-96 flex-col border-l border-[var(--border)] bg-[var(--bg-panel)] shadow-xl lg:shadow-none transition-all',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 bg-[var(--bg-card)]">
        <h3 className="text-sm font-semibold text-[var(--text)] uppercase tracking-wider">Synthesis Lens</h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
            <X size={14} {...defaultIconProps} />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        {activeContext ? (
          <div className="p-4">
            
            {/* Confidence Score Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-[var(--accent)] text-xs font-semibold px-2 py-1 bg-[var(--accent)]/10 rounded-md">
                <Sparkles size={12} /> AI Analysis
              </div>
              <div className="text-xs font-mono text-[var(--text-secondary)]">
                Confidence: <span className="text-[var(--success)]">{activeContext.confidence}%</span>
              </div>
            </div>

            <Tabs value={activeContextTab} onValueChange={(v) => setActiveContextTab(v as 'ai' | 'history' | 'docs')} className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="ai" className="text-xs">Context</TabsTrigger>
                <TabsTrigger value="history" className="text-xs">Linked PRs</TabsTrigger>
                <TabsTrigger value="docs" className="text-xs">Docs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="ai" className="space-y-4 outline-none">
                <MarkdownRenderer content={activeContext.markdown} />
              </TabsContent>

              <TabsContent value="history" className="space-y-4 outline-none">
                <h4 className="text-sm font-semibold text-[var(--text)] mb-3">Originating Pull Requests</h4>
                {activeContext.relatedPrs.map(pr => (
                  <div key={pr} className="flex items-center justify-between p-3 rounded-md border border-[var(--border)] bg-[var(--bg-base)] group hover:border-[var(--accent)] transition-colors cursor-pointer">
                    <div className="flex items-center gap-2">
                      <GitMerge size={14} className="text-[#8957e5]" />
                      <span className="text-sm font-mono text-[var(--text)]">{pr}</span>
                    </div>
                    <ArrowUpRight size={14} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)]" />
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="docs" className="space-y-4 outline-none">
                <h4 className="text-sm font-semibold text-[var(--text)] mb-3">System References</h4>
                <div className="p-4 border border-[var(--border)] border-dashed rounded-md flex flex-col items-center justify-center text-center text-[var(--text-secondary)]">
                  <BookOpen size={24} className="mb-2 opacity-20" />
                  <p className="text-xs">No external documentation linked to this specific decision graph.</p>
                </div>
              </TabsContent>
            </Tabs>

          </div>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center text-center h-full text-[var(--text-secondary)]">
            <FileQuestion size={48} className="opacity-20 mb-4" />
            <h4 className="text-sm font-semibold text-[var(--text)] mb-2">No Context Available</h4>
            <p className="text-xs leading-relaxed">Select a node in the Historical Spine or a file in the Workspace to synthesize engineering context.</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
