import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { defaultIconProps } from '@/design-system/icons';

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  separator?: React.ReactNode;
}

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, separator = <ChevronRight size={14} {...defaultIconProps} />, children, ...props }, ref) => {
    const childArray = React.Children.toArray(children);
    
    return (
      <nav ref={ref} aria-label="breadcrumb" className={cn('flex items-center space-x-1', className)} {...props}>
        {childArray.map((child, index) => (
          <div key={index} className="flex items-center space-x-1">
            {child}
            {index < childArray.length - 1 && (
              <span className="text-[var(--text-secondary)] mx-1">{separator}</span>
            )}
          </div>
        ))}
      </nav>
    );
  }
);
Breadcrumb.displayName = 'Breadcrumb';

export const BreadcrumbItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { active?: boolean }>(
  ({ className, active, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'text-[var(--text-meta)] font-medium transition-colors',
          active ? 'text-[var(--text)]' : 'text-[var(--text-secondary)] hover:text-[var(--text)] cursor-pointer',
          className
        )}
        {...props}
      />
    );
  }
);
BreadcrumbItem.displayName = 'BreadcrumbItem';
