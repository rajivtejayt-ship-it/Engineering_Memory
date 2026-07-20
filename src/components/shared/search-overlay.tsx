'use client';

import * as React from 'react';
import { Modal, ModalContent, ModalOverlay, ModalPortal } from '@/components/ui/modal';
import { SearchInput } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, History, FileText, FileCode } from 'lucide-react';
import { defaultIconProps } from '@/design-system/icons';
import { EmptyState } from '@/components/feedback/states';
import { ScrollArea } from '@/components/ui/scroll-area';

export function SearchOverlay({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = React.useState('');

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalPortal>
        <ModalOverlay className="bg-black/60 backdrop-blur-md" />
        <ModalContent className="fixed inset-4 max-w-none md:inset-10 lg:inset-x-[15%] lg:inset-y-[10%] p-0 border-[var(--border)] bg-[var(--bg-base)] flex flex-col overflow-hidden shadow-2xl rounded-[var(--radius-panel)] translate-x-0 translate-y-0">
          <div className="flex items-center border-b border-[var(--border)] p-4 gap-4 bg-[var(--bg-panel)]">
            <SearchInput
              autoFocus
              placeholder="Search across repositories, timeline, and history..."
              className="h-12 border-none shadow-none text-[var(--text-title-lg)] bg-transparent focus-visible:ring-0 px-0 pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X size={20} {...defaultIconProps} />
            </Button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Search Filters / Sidebar */}
            <div className="hidden md:flex flex-col w-64 border-r border-[var(--border)] bg-[var(--bg-panel)]/50 p-4 space-y-4">
              <h4 className="text-[var(--text-meta)] font-medium text-[var(--text-secondary)] uppercase tracking-wider">Filters</h4>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start font-normal" size="sm">
                  <FileCode size={16} className="mr-2" /> Code
                </Button>
                <Button variant="ghost" className="w-full justify-start font-normal" size="sm">
                  <History size={16} className="mr-2" /> Commits
                </Button>
                <Button variant="ghost" className="w-full justify-start font-normal" size="sm">
                  <FileText size={16} className="mr-2" /> Discussions
                </Button>
              </div>
            </div>

            {/* Search Results */}
            <ScrollArea className="flex-1 bg-[var(--bg-base)]">
              {query.length > 0 ? (
                <div className="p-6">
                  {/* Results Placeholder */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-[var(--text-meta)] text-[var(--text-secondary)] uppercase">File Results</h4>
                      <div className="space-y-2">
                        {['src/middleware/auth.ts', 'src/core/auth/strategy.ts'].filter(f => f.includes(query.toLowerCase()) || query === 'auth').map((file, i) => (
                          <div key={i} className="p-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-panel)] hover:border-[var(--border-hover)] cursor-pointer transition-colors">
                            <h5 className="font-medium text-[var(--text)] text-sm font-mono">{file}</h5>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">Matched in file name</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 mt-6">
                      <h4 className="text-[var(--text-meta)] text-[var(--text-secondary)] uppercase">Timeline Results</h4>
                      <div className="space-y-2">
                        <div className="p-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-panel)] hover:border-[var(--border-hover)] cursor-pointer transition-colors">
                          <h5 className="font-medium text-[var(--text)] text-sm">Fix: handle malformed auth headers</h5>
                          <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">@johndoe • commit-a8f92bd</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <EmptyState
                    title="Search Engineering Memory"
                    description="Start typing to explore the repository intelligence network."
                  />
                </div>
              )}
            </ScrollArea>
          </div>
        </ModalContent>
      </ModalPortal>
    </Modal>
  );
}
