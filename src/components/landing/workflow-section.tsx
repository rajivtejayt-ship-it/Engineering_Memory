'use client';

import * as React from 'react';

import { GitGraph, Download, SearchCode, GitCommit, Network, Lightbulb } from 'lucide-react';
import { defaultIconProps } from '@/design-system/icons';
import { FileStreamLoader } from '@/components/ui/file-stream-loader';

const steps = [
  { icon: GitGraph, label: 'GitHub Sync' },
  { icon: Download, label: 'Data Ingestion' },
  { icon: SearchCode, label: 'Code Analysis' },
  { icon: GitCommit, label: 'Timeline Assembly' },
  { icon: Network, label: 'Context Mapping' },
  { icon: Lightbulb, label: 'Understanding' },
];

export function WorkflowSection() {
  return (
    <section id="how-it-works" className="py-24 bg-[var(--bg-base)]">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-12">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-[var(--text-display)] font-bold text-[var(--text)] tracking-tight mb-4">
            The Intelligence Pipeline
          </h2>
          <p className="text-[var(--text-body)] text-[var(--text-secondary)]">
            Engineering Memory ingests your repository and builds a semantic graph connecting code to human decisions.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[var(--border)] -translate-y-1/2 hidden md:block" />
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 md:gap-0 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center group relative">
                
                {/* Node */}
                <div className="h-16 w-16 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:-translate-y-2 group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] text-[var(--text-secondary)] z-10 relative">
                  <step.icon size={24} {...defaultIconProps} />
                  
                  {/* Active Indicator */}
                  {index === 2 && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--accent)]"></span>
                    </span>
                  )}
                </div>

                {/* Vertical Connector for Mobile */}
                {index < steps.length - 1 && (
                  <div className="h-8 w-px bg-[var(--border)] md:hidden my-2" />
                )}

                {/* Label */}
                <div className="mt-4 text-center">
                  <h4 className="text-[var(--text-meta)] font-bold text-[var(--text)]">{step.label}</h4>
                </div>

              </div>
            ))}
          </div>

        </div>

        <div className="mt-24 flex justify-center">
          <div className="w-full max-w-lg p-6 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-panel)] shadow-xl">
            <h4 className="text-sm font-semibold mb-6 text-[var(--text)]">Live Ingestion Status</h4>
            <FileStreamLoader label="Analyzing PR #892..." />
          </div>
        </div>

      </div>
    </section>
  );
}
