import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'sidebar' | 'timeline' | 'repository';
}

export function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  const baseClass = 'animate-pulse bg-[var(--border)] rounded-md';

  if (variant === 'card') {
    return (
      <div className={cn('flex flex-col space-y-3 p-6 rounded-[var(--radius-card)] border border-[var(--border)]', className)} {...props}>
        <div className={cn(baseClass, 'h-[125px] w-full rounded-xl')} />
        <div className="space-y-2">
          <div className={cn(baseClass, 'h-4 w-[250px]')} />
          <div className={cn(baseClass, 'h-4 w-[200px]')} />
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className={cn('flex flex-col space-y-4 py-4', className)} {...props}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 px-4">
            <div className={cn(baseClass, 'h-8 w-8 rounded-full')} />
            <div className={cn(baseClass, 'h-4 w-full max-w-[150px]')} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'timeline') {
    return (
      <div className={cn('flex flex-col space-y-6', className)} {...props}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex space-x-4">
            <div className="flex flex-col items-center">
              <div className={cn(baseClass, 'h-3 w-3 rounded-full bg-[var(--accent)]')} />
              <div className={cn(baseClass, 'w-px h-full mt-2')} />
            </div>
            <div className="flex flex-col space-y-2 pb-6 w-full">
              <div className={cn(baseClass, 'h-4 w-32')} />
              <div className={cn(baseClass, 'h-20 w-full rounded-[var(--radius-card)]')} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'repository') {
    return (
      <div className={cn('flex flex-col space-y-4 p-6 rounded-[var(--radius-card)] border border-[var(--border)]', className)} {...props}>
        <div className="flex justify-between">
          <div className={cn(baseClass, 'h-6 w-1/3')} />
          <div className={cn(baseClass, 'h-6 w-16')} />
        </div>
        <div className={cn(baseClass, 'h-4 w-2/3')} />
        <div className="flex space-x-4 pt-4">
          <div className={cn(baseClass, 'h-4 w-12')} />
          <div className={cn(baseClass, 'h-4 w-12')} />
        </div>
      </div>
    );
  }

  return <div className={cn(baseClass, className)} {...props} />;
}
