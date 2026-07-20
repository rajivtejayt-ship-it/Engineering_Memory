'use client';

import * as React from 'react';
import Link from 'next/link';
import { useApp } from '@/components/providers/app-provider';
import { EmptyState } from '@/components/feedback/states';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderGit2, Plus, ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { importedRepositories } = useApp();

  return (
    <div className="flex-1 flex flex-col p-8 bg-[var(--bg-base)] overflow-y-auto">
      
      <div className="flex items-center justify-between mb-8 max-w-5xl mx-auto w-full">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your reconstructed engineering memories.</p>
        </div>
        <Button asChild>
          <Link href="/import">
            <Plus size={16} className="mr-2" /> Import Repository
          </Link>
        </Button>
      </div>

      <div className="max-w-5xl mx-auto w-full">
        {importedRepositories.length === 0 ? (
          <EmptyState
            title="No repositories imported"
            description="Start by importing a repository to reconstruct its engineering history."
            action={
              <Button onClick={() => window.location.href = '/import'}>
                Import Repository
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {importedRepositories.map((repo, i) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/repositories/${repo.id}`}>
                  <Card variant="interactive" className="p-5 flex flex-col h-full border border-[var(--border)] hover:border-[var(--accent)]/50 group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                        <FolderGit2 size={20} />
                      </div>
                      <div className="flex-1 truncate">
                        <h3 className="font-semibold text-[var(--text)] truncate">{repo.name}</h3>
                        <p className="text-xs text-[var(--text-secondary)] truncate">{repo.url}</p>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-meta)]">
                        <Clock size={12} />
                        <span>Analyzed just now</span>
                      </div>
                      <ArrowRight size={14} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
