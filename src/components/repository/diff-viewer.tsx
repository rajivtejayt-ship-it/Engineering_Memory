'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, FileDiff } from 'lucide-react';
import { defaultIconProps } from '@/design-system/icons';

export interface DiffLine {
  type: 'added' | 'removed' | 'context' | 'empty';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface DiffViewerProps {
  fileName: string;
  lines: DiffLine[];
  isExpanded?: boolean;
}

export function DiffViewer({ fileName, lines, isExpanded = true }: DiffViewerProps) {
  const [expanded, setExpanded] = React.useState(isExpanded);

  const stats = React.useMemo(() => {
    let additions = 0;
    let deletions = 0;
    lines.forEach(l => {
      if (l.type === 'added') additions++;
      if (l.type === 'removed') deletions++;
    });
    return { additions, deletions };
  }, [lines]);

  return (
    <div className="w-full flex flex-col border border-[var(--border)] rounded-md overflow-hidden bg-[var(--bg-base)]">
      
      {/* Diff Header */}
      <div 
        className="flex items-center justify-between p-2 px-3 bg-[var(--bg-panel)] cursor-pointer hover:bg-[var(--bg-card)] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown size={14} className="text-[var(--text-secondary)]" /> : <ChevronRight size={14} className="text-[var(--text-secondary)]" />}
          <FileDiff size={14} className="text-[var(--text-secondary)]" {...defaultIconProps} />
          <span className="text-sm font-mono font-semibold text-[var(--text)]">{fileName}</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono font-medium">
          <span className="text-[var(--success)]">+{stats.additions}</span>
          <span className="text-[#e34c26]">-{stats.deletions}</span>
        </div>
      </div>

      {/* Diff Body */}
      {expanded && (
        <div className="flex flex-col font-mono text-sm leading-[1.6] bg-[#0d1117] overflow-x-auto text-[#c9d1d9]">
          {lines.map((line, idx) => (
            <div 
              key={idx} 
              className={cn(
                'flex w-full',
                line.type === 'added' && 'bg-[var(--success)]/15',
                line.type === 'removed' && 'bg-[#e34c26]/15',
                line.type === 'empty' && 'bg-[#161b22] opacity-50 justify-center text-xs py-1'
              )}
            >
              {line.type === 'empty' ? (
                <span>@@ ... @@</span>
              ) : (
                <>
                  <div className="flex shrink-0 w-16 select-none opacity-50 border-r border-[#30363d] bg-[#161b22]">
                    <div className="w-8 text-right pr-2">{line.oldLineNumber || ' '}</div>
                    <div className="w-8 text-right pr-2">{line.newLineNumber || ' '}</div>
                  </div>
                  <div className={cn(
                    'w-6 shrink-0 text-center font-bold select-none',
                    line.type === 'added' ? 'text-[var(--success)]' : '',
                    line.type === 'removed' ? 'text-[#e34c26]' : ''
                  )}>
                    {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                  </div>
                  <div className="flex-1 whitespace-pre pl-1 pr-4">
                    {line.content}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
