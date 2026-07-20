'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { transitions } from '@/design-system/motion';

export interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger: React.ReactNode;
}

export const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ className, open, onOpenChange, trigger, children, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(open || false);

    React.useEffect(() => {
      if (open !== undefined) {
        setIsOpen(open);
      }
    }, [open]);

    const handleToggle = () => {
      const newState = !isOpen;
      setIsOpen(newState);
      if (onOpenChange) {
        onOpenChange(newState);
      }
    };

    return (
      <div ref={ref} className={cn('flex flex-col', className)} {...props}>
        <button type="button" onClick={handleToggle} className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded w-full text-left">
          {trigger}
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={transitions.structural}
              className="overflow-hidden"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
Collapsible.displayName = 'Collapsible';
