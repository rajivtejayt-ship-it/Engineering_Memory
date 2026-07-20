'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Search, Eye, EyeOff, Command } from 'lucide-react';
import { defaultIconProps } from '@/design-system/icons';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-[var(--radius-btn)] border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-[var(--text-body)] text-[var(--text)] placeholder:text-[var(--text-secondary)] focus-visible:outline-none focus-visible:border-[var(--accent)] focus-visible:ring-1 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          error && 'border-[var(--danger)] focus-visible:border-[var(--danger)] focus-visible:ring-[var(--danger)]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export const SearchInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
          size={16}
          {...defaultIconProps}
        />
        <Input
          className={cn('pl-9', className)}
          type="search"
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';

export const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [show, setShow] = React.useState(false);

    return (
      <div className="relative w-full">
        <Input
          className={cn('pr-10', className)}
          type={show ? 'text' : 'password'}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
        >
          {show ? (
            <EyeOff size={16} {...defaultIconProps} />
          ) : (
            <Eye size={16} {...defaultIconProps} />
          )}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

export const CommandInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <Command
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
          size={16}
          {...defaultIconProps}
        />
        <Input
          className={cn(
            'pl-9 h-12 text-[var(--text-title-lg)] bg-transparent border-none focus-visible:ring-0 focus-visible:border-none px-0',
            className
          )}
          type="text"
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
CommandInput.displayName = 'CommandInput';
