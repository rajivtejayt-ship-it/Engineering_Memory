'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // A very simple mock markdown renderer for demonstration.
  // In production, this would use react-markdown or marked with custom components.
  
  const parseMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Headings
      if (line.startsWith('### ')) {
        return <h4 key={i} className="text-sm font-bold text-[var(--text)] mt-4 mb-2">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={i} className="text-base font-bold text-[var(--text)] mt-5 mb-3">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={i} className="text-lg font-bold text-[var(--text)] mt-6 mb-4">{line.replace('# ', '')}</h2>;
      }
      
      // Tables (Mock rendering)
      if (line.includes('|') && !line.includes('---')) {
        const cells = line.split('|').filter(c => c.trim() !== '');
        return (
          <div key={i} className="flex border-b border-[var(--border)] py-1.5 px-2 text-sm first:bg-[var(--bg-card)] first:font-semibold">
            {cells.map((cell, j) => (
              <div key={j} className="flex-1 text-[var(--text-secondary)]">{cell.trim()}</div>
            ))}
          </div>
        );
      }
      if (line.includes('|') && line.includes('---')) return null;

      // Lists
      if (line.startsWith('- ')) {
        return <li key={i} className="text-sm text-[var(--text-secondary)] ml-4 list-disc marker:text-[var(--text-secondary)]">{line.replace('- ', '')}</li>;
      }
      
      // Empty lines
      if (line.trim() === '') return <div key={i} className="h-2" />;
      
      // Safe Inline Parsing
      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
      
      return (
        <p key={i} className="text-sm text-[var(--text-secondary)] leading-relaxed mb-2">
          {parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={index} className="text-[var(--text)] font-semibold">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
              return <code key={index} className="bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] px-1 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
            }
            return <span key={index}>{part}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {parseMarkdown(content)}
    </div>
  );
}
