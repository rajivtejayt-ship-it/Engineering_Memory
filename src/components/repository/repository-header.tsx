'use client';

import * as React from 'react';
import { ChevronRight, GitBranch, Settings, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { defaultIconProps } from '@/design-system/icons';

export function RepositoryHeader({ repoName = 'engineering-memory' }: { repoName?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-[var(--border)] bg-[var(--bg-base)]">
      
      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[var(--text-secondary)] font-medium">acme-corp</span>
        <ChevronRight size={14} className="text-[var(--text-secondary)] opacity-50" />
        <span className="text-[var(--text)] font-bold">{repoName}</span>
        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border border-[var(--border)] text-[var(--text-secondary)] bg-[var(--bg-panel)]">
          Public
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 text-xs font-mono">
          <GitBranch size={14} className="mr-2" {...defaultIconProps} />
          main
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Star size={14} {...defaultIconProps} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings size={14} {...defaultIconProps} />
        </Button>
      </div>

    </div>
  );
}
