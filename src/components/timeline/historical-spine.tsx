'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRepository } from '@/components/providers/repository-provider';
import { TimelineNodeType } from '@/types/repository';
import { MOCK_TIMELINE } from '@/mock-data/repository';
import { GitCommit, GitPullRequest, AlertCircle, Bookmark, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { defaultIconProps } from '@/design-system/icons';

const NODE_COLORS: Record<TimelineNodeType, string> = {
  commit: 'text-[var(--success)] bg-[var(--success)]/10 border-[var(--success)]/30',
  pr: 'text-[#8957e5] bg-[#8957e5]/10 border-[#8957e5]/30',
  issue: 'text-[var(--danger)] bg-[var(--danger)]/10 border-[var(--danger)]/30',
  release: 'text-[var(--text)] bg-[var(--text)]/10 border-[var(--text)]/30',
  decision: 'text-[var(--accent)] bg-[var(--accent)]/10 border-[var(--accent)]/30',
};

const NODE_ICONS: Record<TimelineNodeType, React.ElementType> = {
  commit: GitCommit,
  pr: GitPullRequest,
  issue: AlertCircle,
  release: Bookmark,
  decision: Zap,
};

export function HistoricalSpine() {
  const { selectedNodeId, setSelectedNodeId } = useRepository();

  return (
    <div className="flex h-full w-full flex-col bg-[var(--bg-panel)]">
      <div className="p-4 border-b border-[var(--border)]">
        <h3 className="text-[var(--text-body)] font-semibold text-[var(--text)] tracking-tight">Historical Spine</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Chronological intent graph</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 relative">
          
          {/* Vertical Track */}
          <div className="absolute left-7 top-4 bottom-4 w-px bg-[var(--border)]" />

          <div className="flex flex-col gap-6 relative z-10">
            {MOCK_TIMELINE.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const Icon = NODE_ICONS[node.type];
              
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={cn(
                    'group relative flex items-start gap-4 text-left p-2 -ml-2 rounded-[var(--radius-panel)] transition-all',
                    isSelected ? 'bg-[var(--bg-card)] shadow-md border border-[var(--border)]' : 'hover:bg-[var(--bg-card)]/50 border border-transparent'
                  )}
                >
                  
                  {/* Node Icon */}
                  <div className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-btn)] border mt-1 relative z-10',
                    NODE_COLORS[node.type],
                    isSelected ? 'shadow-[0_0_12px_rgba(var(--accent-rgb),0.3)]' : ''
                  )}>
                    <Icon size={12} {...defaultIconProps} />
                  </div>

                  {/* Node Content */}
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-sm font-semibold truncate', isSelected ? 'text-[var(--text)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text)]')}>
                        {node.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
                      <span>@{node.author}</span>
                      <span className="opacity-50">•</span>
                      <span>{new Date(node.timestamp).toLocaleDateString()}</span>
                    </div>
                    {isSelected && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed"
                      >
                        {node.description}
                      </motion.div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      </ScrollArea>
    </div>
  );
}
