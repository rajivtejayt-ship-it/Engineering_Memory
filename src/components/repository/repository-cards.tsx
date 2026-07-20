'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Activity, ShieldCheck, GitBranch, AlertCircle, FileCode } from 'lucide-react';

export function RepositoryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      
      {/* Overview Card */}
      <Card variant="basic" className="p-4 flex flex-col gap-3 border-[var(--border)]">
        <div className="flex items-center justify-between text-[var(--text-secondary)]">
          <span className="text-xs font-semibold uppercase tracking-wider">Codebase Health</span>
          <ShieldCheck size={16} className="text-[var(--success)]" />
        </div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-[var(--text)]">98.4%</span>
          <span className="text-xs text-[var(--text-secondary)] mb-1">stability index</span>
        </div>
        <div className="h-1 w-full bg-[var(--bg-base)] rounded-full overflow-hidden mt-1">
          <div className="h-full bg-[var(--success)] w-[98%]" />
        </div>
      </Card>

      {/* Language Breakdown */}
      <Card variant="basic" className="p-4 flex flex-col gap-3 border-[var(--border)]">
        <div className="flex items-center justify-between text-[var(--text-secondary)]">
          <span className="text-xs font-semibold uppercase tracking-wider">Languages</span>
          <FileCode size={16} />
        </div>
        <div className="flex gap-4 items-end mt-1">
          <div className="flex flex-col gap-1">
            <span className="text-xl font-bold text-[var(--text)]">84%</span>
            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#3178c6]" /> TypeScript
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xl font-bold text-[var(--text)]">16%</span>
            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#e34c26]" /> HTML/CSS
            </span>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card variant="basic" className="p-4 flex flex-col gap-3 border-[var(--border)]">
        <div className="flex items-center justify-between text-[var(--text-secondary)]">
          <span className="text-xs font-semibold uppercase tracking-wider">Velocity</span>
          <Activity size={16} className="text-[var(--accent)]" />
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-[var(--text)]">24</span>
            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1"><GitBranch size={10}/> PRs (7d)</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-[var(--text)]">6</span>
            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1"><AlertCircle size={10}/> Issues</span>
          </div>
        </div>
      </Card>

    </div>
  );
}
