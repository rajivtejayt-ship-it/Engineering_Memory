'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRepository } from '@/components/providers/repository-provider';
import { MOCK_CODE_CONTENT } from '@/mock-data/repository';
import { FileCode2, Copy } from 'lucide-react';
import { defaultIconProps } from '@/design-system/icons';
import { Button } from '@/components/ui/button';

export function CodeViewer() {
  const { selectedFilePath, activeNode } = useRepository();

  if (!selectedFilePath) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] h-full">
        <FileCode2 size={48} className="opacity-20 mb-4" />
        <p>No file selected</p>
      </div>
    );
  }

  const content = MOCK_CODE_CONTENT[selectedFilePath];
  
  if (!content) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] h-full">
        <p>File content not available</p>
      </div>
    );
  }

  const lines = content.split('\n');
  const isModifiedInCurrentNode = activeNode?.filesChanged.includes(selectedFilePath);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1117] overflow-hidden rounded-md border border-[var(--border)]">
      
      {/* File Header */}
      <div className="flex items-center justify-between p-2 px-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-2">
          <FileCode2 size={16} className="text-[var(--text-secondary)]" {...defaultIconProps} />
          <span className="text-sm font-mono text-[#c9d1d9] font-medium">{selectedFilePath}</span>
        </div>
        <div className="flex items-center gap-2">
          {isModifiedInCurrentNode && (
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded">
              Modified in current selection
            </span>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6 text-[#8b949e] hover:text-[#c9d1d9]">
            <Copy size={14} />
          </Button>
        </div>
      </div>

      {/* Code Area */}
      <ScrollArea className="flex-1">
        <div className="p-4 font-mono text-sm leading-[1.6] select-text">
          {lines.map((line, index) => {
            const lineNum = index + 1;
            
            // Safe syntax highlighting using a simple tokenizer
            const syntaxRegex = /(\/\/.*|'.*?'|".*?"|`.*?`|\b(?:import|export|const|let|var|if|return|async|await|try|catch|function|new|throw)\b|[a-zA-Z0-9_]+(?=\())/g;
            const tokens = line.split(syntaxRegex);
            
            // Mock highlight specific lines based on the file and active node
            let isHighlighted = false;
            let isAdded = false;
            
            if (isModifiedInCurrentNode && selectedFilePath === 'src/middleware/auth.ts' && lineNum >= 7 && lineNum <= 15) {
              isHighlighted = true;
              isAdded = true;
            }
            
            return (
              <div 
                key={index} 
                className={cn(
                  'flex group relative',
                  isHighlighted ? 'bg-[var(--accent)]/15 -mx-4 px-4 relative z-10' : 'hover:bg-[#161b22] -mx-4 px-4'
                )}
              >
                {isHighlighted && (
                  <div className={cn(
                    'absolute left-0 top-0 bottom-0 w-1',
                    isAdded ? 'bg-[var(--accent)]' : 'bg-[#e34c26]'
                  )} />
                )}
                
                {/* Line Number */}
                <div className="w-10 shrink-0 text-right pr-4 text-[#8b949e] select-none opacity-50 group-hover:opacity-100">
                  {lineNum}
                </div>
                
                {/* Code Line - Safely Rendered */}
                <div className={cn('flex-1 whitespace-pre', isHighlighted ? 'text-[#c9d1d9]' : 'text-[#c9d1d9]/90')}>
                  {tokens.length === 1 && tokens[0] === '' ? ' ' : tokens.map((token, i) => {
                    if (!token) return null;
                    if (token.startsWith('//')) return <span key={i} className="text-[#8b949e] opacity-80 italic">{token}</span>;
                    if (/^['"`]/.test(token)) return <span key={i} className="text-[#a5d6ff]">{token}</span>;
                    if (/^(?:import|export|const|let|var|if|return|async|await|try|catch|function|new|throw)$/.test(token)) return <span key={i} className="text-[#ff7b72]">{token}</span>;
                    if (/^[a-zA-Z0-9_]+$/.test(token) && i % 2 === 1) return <span key={i} className="text-[#d2a8ff]">{token}</span>;
                    return <span key={i}>{token}</span>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
