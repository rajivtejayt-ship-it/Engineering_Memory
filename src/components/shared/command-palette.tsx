'use client';

import * as React from 'react';
import { Modal, ModalContent, ModalOverlay, ModalPortal } from '@/components/ui/modal';
import { CommandInput } from '@/components/ui/input';
import { FileCode, Terminal, GitMerge, FileText } from 'lucide-react';
import { defaultIconProps } from '@/design-system/icons';

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalPortal>
        <ModalOverlay className="bg-black/40 backdrop-blur-sm" />
        <ModalContent className="top-[25%] translate-y-0 max-w-2xl p-0 gap-0 border-[var(--border)] bg-[var(--bg-panel)] overflow-hidden shadow-2xl">
          <div className="border-b border-[var(--border)] px-4">
            <CommandInput autoFocus placeholder="Type a command or search..." className="h-14 border-none shadow-none focus-visible:ring-0" />
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-2">
            <div className="px-2 py-1.5 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Recent Searches
            </div>
            <div className="flex flex-col space-y-1">
              {[
                { icon: FileCode, label: 'Find occurrences of UserAuthSession' },
                { icon: GitMerge, label: 'PR #142: Refactor auth strategy' },
                { icon: FileText, label: 'Documentation: Authentication flows' },
                { icon: Terminal, label: 'Run database migrations' },
              ].map((item, i) => (
                <button
                  key={i}
                  className="flex items-center space-x-3 w-full rounded-md px-3 py-2.5 text-left text-[var(--text-body)] text-[var(--text)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-colors focus:bg-[var(--accent)]/10 focus:text-[var(--accent)] focus:outline-none"
                >
                  <item.icon size={16} {...defaultIconProps} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </ModalContent>
      </ModalPortal>
    </Modal>
  );
}
