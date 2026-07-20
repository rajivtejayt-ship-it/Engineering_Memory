'use client';

import * as React from 'react';
import { RepositoryHeader } from '@/components/repository/repository-header';
import { RepositoryCards } from '@/components/repository/repository-cards';
import { FileExplorer } from '@/components/repository/file-explorer';
import { CodeViewer } from '@/components/repository/code-viewer';
import { DiffViewer, DiffLine } from '@/components/repository/diff-viewer';
import { useRepository } from '@/components/providers/repository-provider';

// Mock Diff data for demonstration
const mockDiffLines: DiffLine[] = [
  { type: 'context', content: '  // Extract Bearer token safely', oldLineNumber: 4, newLineNumber: 4 },
  { type: 'removed', content: '  const token = req.headers.authorization;', oldLineNumber: 5 },
  { type: 'added', content: "  const authHeader = req.headers.authorization;", newLineNumber: 5 },
  { type: 'added', content: "  if (!authHeader?.startsWith('Bearer ')) {", newLineNumber: 6 },
  { type: 'added', content: "    return res.status(401).json({ error: 'Missing or invalid authorization header' });", newLineNumber: 7 },
  { type: 'added', content: "  }", newLineNumber: 8 },
  { type: 'added', content: "", newLineNumber: 9 },
  { type: 'added', content: "  const token = authHeader.split(' ')[1];", newLineNumber: 10 },
  { type: 'context', content: '  if (!token) {', oldLineNumber: 6, newLineNumber: 11 },
];

export default function RepositoryWorkspace({ params }: { params: { id: string } }) {
  const { activeNode } = useRepository();

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-base)]">
      
      {/* Top Header */}
      <RepositoryHeader repoName={params.id} />
      
      {/* Scrollable Workspace Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-screen-2xl mx-auto h-full">
          
          {/* Summary Cards */}
          <RepositoryCards />

          {/* Core Two-Pane Code Workspace */}
          <div className="flex flex-1 min-h-[600px] border border-[var(--border)] rounded-[var(--radius-panel)] overflow-hidden shadow-sm bg-[var(--bg-base)]">
            
            {/* Left: File Explorer */}
            <FileExplorer />

            {/* Right: Code & Diffs */}
            <div className="flex-1 flex flex-col p-4 bg-[var(--bg-panel)] gap-4 overflow-y-auto">
              
              {/* Diff Viewer (Only show if PR or Commit is selected) */}
              {(activeNode?.type === 'commit' || activeNode?.type === 'pr') && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-[var(--text)] mb-3">Modified Files</h4>
                  <DiffViewer fileName="src/middleware/auth.ts" lines={mockDiffLines} />
                </div>
              )}

              {/* Code Viewer (Main Content) */}
              <h4 className="text-sm font-semibold text-[var(--text)]">File Content</h4>
              <CodeViewer />
              
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
