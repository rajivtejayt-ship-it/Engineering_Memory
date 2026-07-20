import * as React from 'react';
import { cn } from '@/lib/utils';
import { FileQuestion, AlertTriangle, Loader2 } from 'lucide-react';
import { defaultIconProps } from '@/design-system/icons';
import { motion } from 'framer-motion';

export interface StateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, StateProps>(
  ({ className, title = 'No results found', description, action, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col items-center justify-center p-8 text-center space-y-4', className)} {...props}>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-panel)] text-[var(--text-secondary)]">
          <FileQuestion size={24} {...defaultIconProps} />
        </div>
        <div className="space-y-1">
          <h4 className="text-[var(--text-body)] font-medium text-[var(--text)]">{title}</h4>
          {description && <p className="text-[var(--text-meta)] text-[var(--text-secondary)] max-w-sm">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    );
  }
);
EmptyState.displayName = 'EmptyState';

export const ErrorState = React.forwardRef<HTMLDivElement, StateProps>(
  ({ className, title = 'Something went wrong', description, action, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col items-center justify-center p-8 text-center space-y-4', className)} {...props}>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--danger)]/10 text-[var(--danger)]">
          <AlertTriangle size={24} {...defaultIconProps} />
        </div>
        <div className="space-y-1">
          <h4 className="text-[var(--text-body)] font-medium text-[var(--text)]">{title}</h4>
          {description && <p className="text-[var(--text-meta)] text-[var(--text-secondary)] max-w-sm">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    );
  }
);
ErrorState.displayName = 'ErrorState';

export const LoadingState = React.forwardRef<HTMLDivElement, StateProps & { compact?: boolean }>(
  ({ className, title = 'Loading...', description, compact = false, ...props }, ref) => {
    if (compact) {
      return (
        <div ref={ref} className={cn('flex items-center space-x-2 text-[var(--text-secondary)]', className)} {...props}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <Loader2 size={16} {...defaultIconProps} />
          </motion.div>
          <span className="text-[var(--text-meta)] font-medium">{title}</span>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn('flex flex-col items-center justify-center p-8 text-center space-y-4', className)} {...props}>
        <motion.div 
          className="text-[var(--accent)]"
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <Loader2 size={32} {...defaultIconProps} />
        </motion.div>
        <div className="space-y-1">
          <h4 className="text-[var(--text-body)] font-medium text-[var(--text)]">{title}</h4>
          {description && <p className="text-[var(--text-meta)] text-[var(--text-secondary)] max-w-sm">{description}</p>}
        </div>
      </div>
    );
  }
);
LoadingState.displayName = 'LoadingState';
