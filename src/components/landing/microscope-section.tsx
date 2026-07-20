'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { transitions } from '@/design-system/motion';
import { Card } from '@/components/ui/card';
import { Panel } from '@/components/ui/panel';
import { FileCode, GitCommit, AlertCircle, Sparkles, FolderTree } from 'lucide-react';
import { defaultIconProps } from '@/design-system/icons';

const mockFiles = [
  { id: 'auth', name: 'auth.ts', type: 'file' },
  { id: 'router', name: 'api-router.ts', type: 'file' },
  { id: 'db', name: 'database', type: 'folder' },
  { id: 'models', name: 'user-model.ts', type: 'file' },
];

export function MicroscopeSection() {
  const [activeFile, setActiveFile] = React.useState('auth');
  const [activeTab, setActiveTab] = React.useState<'commit' | 'issue' | 'ai'>('commit');

  return (
    <section id="demo" className="py-24 bg-[var(--bg-base)]">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-12 flex flex-col items-center">
        
        <div className="text-center max-w-3xl mb-16">
          <h2 className="text-[var(--text-display)] font-bold text-[var(--text)] tracking-tight mb-4">
            Interactive Microscope
          </h2>
          <p className="text-[var(--text-body)] text-[var(--text-secondary)]">
            Engineering Memory automatically maps files to the decisions that created them. Select a file below to explore its forensic history.
          </p>
        </div>

        <div className="w-full flex flex-col lg:flex-row gap-6 h-[500px]">
          
          {/* File Explorer (Left) */}
          <Panel variant="surface" className="lg:w-1/3 flex flex-col p-0 overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-card)]">
              <div className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider font-semibold">
                Repository Tree
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {mockFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setActiveFile(file.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeFile === file.id
                      ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text)]'
                  }`}
                >
                  {file.type === 'folder' ? (
                    <FolderTree size={16} {...defaultIconProps} />
                  ) : (
                    <FileCode size={16} {...defaultIconProps} />
                  )}
                  {file.name}
                </button>
              ))}
            </div>
          </Panel>

          {/* Forensic Detail (Right) */}
          <Panel variant="glass" className="lg:w-2/3 flex flex-col p-0 overflow-hidden relative">
            <div className="flex items-center gap-4 p-4 border-b border-[var(--border)]">
              <button
                onClick={() => setActiveTab('commit')}
                className={`text-sm font-medium transition-colors pb-1 ${activeTab === 'commit' ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text)]'}`}
              >
                Origin Commit
              </button>
              <button
                onClick={() => setActiveTab('issue')}
                className={`text-sm font-medium transition-colors pb-1 ${activeTab === 'issue' ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text)]'}`}
              >
                Linked Issue
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`text-sm font-medium transition-colors pb-1 ${activeTab === 'ai' ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text)]'}`}
              >
                AI Reasoning
              </button>
            </div>

            <div className="flex-1 p-6 relative">
              <AnimatePresence mode="wait">
                {activeTab === 'commit' && (
                  <motion.div
                    key="commit"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={transitions.structural}
                    className="flex flex-col gap-4 h-full"
                  >
                    <div className="flex items-center gap-3 text-[var(--text)]">
                      <div className="p-2 rounded-full bg-[var(--success)]/10 text-[var(--success)]">
                        <GitCommit size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold">Implement strict JWT validation</h4>
                        <p className="text-sm text-[var(--text-secondary)] font-mono">Commit a8f92bd by @johndoe</p>
                      </div>
                    </div>
                    <Card variant="interactive" className="p-4 mt-4 font-mono text-sm bg-black border-[var(--border)] text-[#c9d1d9]">
                      <div className="text-[#ff7b72]">- const token = req.headers.authorization;</div>
                      <div className="text-[#3fb950]">+ const token = req.headers.authorization?.split(&apos; &apos;)[1];</div>
                      <div className="text-[#3fb950]">+ if (!token) throw new Error(&apos;Unauthorized&apos;);</div>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 'issue' && (
                  <motion.div
                    key="issue"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={transitions.structural}
                    className="flex flex-col gap-4 h-full"
                  >
                    <div className="flex items-center gap-3 text-[var(--text)]">
                      <div className="p-2 rounded-full bg-[var(--danger)]/10 text-[var(--danger)]">
                        <AlertCircle size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold">Bug: Invalid token crashes server</h4>
                        <p className="text-sm text-[var(--text-secondary)]">Issue #402 opened by @tester</p>
                      </div>
                    </div>
                    <div className="p-4 bg-[var(--bg-card)] rounded-md mt-4 text-sm text-[var(--text-secondary)] border border-[var(--border)] leading-relaxed">
                      &quot;When sending a malformed Authorization header, the server throws an uncaught exception instead of returning a 401. This needs to be handled cleanly.&quot;
                    </div>
                  </motion.div>
                )}

                {activeTab === 'ai' && (
                  <motion.div
                    key="ai"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={transitions.structural}
                    className="flex flex-col gap-4 h-full"
                  >
                    <div className="flex items-center gap-3 text-[var(--text)]">
                      <div className="p-2 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold">Design Decision Extracted</h4>
                        <p className="text-sm text-[var(--text-secondary)]">Generated by Engineering Memory</p>
                      </div>
                    </div>
                    <div className="p-4 bg-[var(--accent)]/5 rounded-md mt-4 text-sm text-[var(--text)] border border-[var(--accent)]/20 leading-relaxed">
                      This file contains the core JWT extraction logic. In PR #403, the team explicitly moved away from raw header parsing to standard Bearer token extraction to comply with OAuth 2.0 standards, resolving the server crashes reported in Issue #402. Do not revert this to raw header extraction.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Panel>

        </div>
      </div>
    </section>
  );
}
