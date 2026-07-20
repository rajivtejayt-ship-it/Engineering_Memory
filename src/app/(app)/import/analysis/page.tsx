'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/feedback/toast';
import { FileStreamLoader } from '@/components/ui/file-stream-loader';
import { Hexagon, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STAGES = [
  'Cloning repository...',
  'Indexing commit history...',
  'Analyzing pull requests...',
  'Connecting issues & discussions...',
  'Reconstructing timeline...',
  'Generating Engineering Memory...',
];

function AnalysisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repoName = searchParams.get('repo') || 'Repository';
  const { toast } = useToast();
  
  const [currentStage, setCurrentStage] = React.useState(0);
  const [completedStages, setCompletedStages] = React.useState<number[]>([]);

  React.useEffect(() => {
    let current = 0;
    
    // Progress through stages mock
    const interval = setInterval(() => {
      current++;
      if (current < STAGES.length) {
        setCompletedStages(prev => [...prev, current - 1]);
        setCurrentStage(current);
      } else {
        clearInterval(interval);
        // Complete!
        setTimeout(() => {
          toast({
            title: 'Analysis Complete',
            description: `${repoName} has been successfully reconstructed.`,
            type: 'success'
          });
          router.push('/dashboard');
        }, 1000);
      }
    }, 1500); // 1.5 seconds per mock stage

    return () => clearInterval(interval);
  }, [repoName, router, toast]);

  return (
    <div className="flex-1 flex items-center justify-center bg-[var(--bg-base)] p-4 relative overflow-hidden">
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent)]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-3xl flex flex-col items-center relative z-10">
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="h-20 w-20 bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl flex items-center justify-center mb-8 shadow-2xl relative"
        >
          {currentStage === STAGES.length ? (
            <CheckCircle2 size={40} className="text-[var(--success)]" />
          ) : (
            <Hexagon size={40} className="text-[var(--accent)] animate-pulse" />
          )}
          
          {/* Subtle spinning border effect mock */}
          {currentStage < STAGES.length && (
            <div className="absolute inset-[-1px] rounded-2xl border border-transparent border-t-[var(--accent)] animate-spin-slow opacity-50" />
          )}
        </motion.div>

        <h2 className="text-2xl font-bold text-[var(--text)] tracking-tight mb-2">
          Diagnostic Analysis
        </h2>
        <p className="text-[var(--text-secondary)] text-sm mb-12 font-mono">
          Target: <span className="text-[var(--accent)]">{repoName}</span>
        </p>

        {/* Diagnostic Stages */}
        <div className="w-full max-w-md space-y-4 mb-16">
          <AnimatePresence>
            {STAGES.map((stage, index) => {
              if (index > currentStage) return null;
              
              const isCompleted = completedStages.includes(index);
              const isActive = currentStage === index;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 text-sm font-mono"
                >
                  <div className="w-6 flex justify-center">
                    {isCompleted ? (
                      <CheckCircle2 size={16} className="text-[var(--success)]" />
                    ) : isActive ? (
                      <Loader2 size={16} className="text-[var(--accent)] animate-spin" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--border)]" />
                    )}
                  </div>
                  <span className={isCompleted ? 'text-[var(--text-secondary)]' : isActive ? 'text-[var(--text)]' : 'text-[var(--text-secondary)] opacity-50'}>
                    {stage}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* File Stream Visualization */}
        <div className="w-full h-32 opacity-70 pointer-events-none">
           <FileStreamLoader />
        </div>

      </div>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <React.Suspense fallback={<div className="flex-1 flex items-center justify-center bg-[var(--bg-base)]"><div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" /></div>}>
      <AnalysisContent />
    </React.Suspense>
  );
}
