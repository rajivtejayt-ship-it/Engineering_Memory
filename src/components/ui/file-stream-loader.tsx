'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface FileStreamLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export const FileStreamLoader = React.forwardRef<HTMLDivElement, FileStreamLoaderProps>(
  ({ className, label = 'Processing stream...', ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col space-y-3 w-full max-w-sm', className)} {...props}>
        <div className="flex items-center justify-between text-[var(--text-meta)] font-medium font-mono text-[var(--text-secondary)]">
          <span>{label}</span>
          <motion.span 
            animate={{ opacity: [1, 0.5, 1] }} 
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            _
          </motion.span>
        </div>
        
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-panel)]">
          <motion.div
            className="absolute inset-y-0 left-0 w-1/3 bg-[var(--accent)] rounded-full"
            animate={{
              x: ['-100%', '300%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <motion.div
            className="absolute inset-y-0 left-0 w-1/6 bg-[var(--accent)]/50 rounded-full"
            animate={{
              x: ['-200%', '400%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
              delay: 0.2,
            }}
          />
        </div>
      </div>
    );
  }
);
FileStreamLoader.displayName = 'FileStreamLoader';
