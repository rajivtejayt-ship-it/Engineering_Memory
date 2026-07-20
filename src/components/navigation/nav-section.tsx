import * as React from 'react';
import { cn } from '@/lib/utils';

export interface NavSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export const NavSection = React.forwardRef<HTMLDivElement, NavSectionProps>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col space-y-2', className)} {...props}>
        {title && (
          <h4 className="px-3 text-[var(--text-meta)] font-medium text-[var(--text-secondary)] uppercase tracking-wider">
            {title}
          </h4>
        )}
        <div className="flex flex-col space-y-1">
          {children}
        </div>
      </div>
    );
  }
);
NavSection.displayName = 'NavSection';
