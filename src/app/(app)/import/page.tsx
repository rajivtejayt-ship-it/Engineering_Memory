'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/providers/app-provider';
import { Card } from '@/components/ui/card';
import { CommandInput } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FolderGit2, SearchCode, History, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const RECENT_REPOS = [
  { name: 'facebook/react', url: 'https://github.com/facebook/react' },
  { name: 'vercel/next.js', url: 'https://github.com/vercel/next.js' },
  { name: 'microsoft/vscode', url: 'https://github.com/microsoft/vscode' },
];

export default function ImportPage() {
  const router = useRouter();
  const { importRepository } = useApp();
  const [url, setUrl] = React.useState('');

  const handleImport = (repoUrl: string, repoName: string) => {
    // In a real app, this would trigger a backend job. 
    // Here we just set the mock state and push to the analysis loading screen.
    importRepository(repoUrl, repoName);
    router.push(`/import/analysis?repo=${encodeURIComponent(repoName)}`);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    // Extract name from URL or use as is
    let name = url;
    try {
      const parsed = new URL(url);
      name = parsed.pathname.substring(1); // strip leading slash
    } catch {
      // not a valid url, just use string
    }
    
    handleImport(url, name || 'custom-repository');
  };

  return (
    <div className="flex-1 flex flex-col items-center pt-24 px-4 h-full bg-[var(--bg-base)]">
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl flex flex-col items-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text)] mb-6 shadow-sm">
          <FolderGit2 size={24} />
        </div>
        
        <h2 className="text-2xl font-bold text-[var(--text)] tracking-tight mb-2 text-center">
          Import Repository
        </h2>
        <p className="text-sm text-[var(--text-secondary)] text-center mb-6 max-w-md">
          Enter a public repository URL to begin the semantic analysis and history reconstruction.
        </p>

        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-md p-3 mb-8 w-full max-w-md">
          <p className="text-xs text-[var(--accent)] text-center font-medium">
            Demo Mode is active. Repository analysis and AI responses will be simulated using pre-indexed mock data.
          </p>
        </div>

        <form onSubmit={onSubmit} className="w-full relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-full" />
          <div className="relative flex items-center bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-lg focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)] transition-all">
            <CommandInput 
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repository" 
              className="h-16 text-lg border-none shadow-none focus-visible:ring-0 bg-transparent flex-1 px-6 text-[var(--text)] placeholder:text-[var(--text-secondary)]" 
            />
            <Button 
              type="submit" 
              disabled={!url}
              className="h-12 mr-2 px-6 rounded-xl font-semibold flex items-center gap-2"
            >
              Analyze <ArrowRight size={16} />
            </Button>
          </div>
        </form>

        <div className="w-full mt-12">
          <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-2">
            <History size={14} /> Example Repositories
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {RECENT_REPOS.map((repo, i) => (
              <Card 
                key={i} 
                variant="interactive" 
                className="p-4 flex flex-col gap-2 cursor-pointer group border border-[var(--border)] hover:border-[var(--border-hover)]"
                onClick={() => handleImport(repo.url, repo.name)}
              >
                <div className="flex items-center justify-between">
                  <SearchCode size={16} className="text-[var(--text-secondary)] group-hover:text-[var(--text)] transition-colors" />
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-[var(--accent)]" />
                </div>
                <span className="text-sm font-semibold text-[var(--text)] truncate mt-2">{repo.name}</span>
              </Card>
            ))}
          </div>
        </div>

      </motion.div>

    </div>
  );
}
