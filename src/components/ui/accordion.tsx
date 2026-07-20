'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { defaultIconProps } from '@/design-system/icons';
import { transitions } from '@/design-system/motion';

export type AccordionProps = React.HTMLAttributes<HTMLDivElement>;

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-1', className)} {...props} />
  )
);
Accordion.displayName = 'Accordion';

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  defaultOpen?: boolean;
}

export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, title, defaultOpen = false, children, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
      <div ref={ref} className={cn('border-b border-[var(--border)] overflow-hidden', className)} {...props}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between py-4 text-[var(--text-body)] font-medium text-[var(--text)] transition-all hover:text-[var(--accent)]"
        >
          {title}
          <motion.div
            initial={false}
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={transitions.interaction}
          >
            <ChevronDown size={16} {...defaultIconProps} />
          </motion.div>
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={transitions.structural}
            >
              <div className="pb-4 text-[var(--text-meta)] text-[var(--text-secondary)]">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
AccordionItem.displayName = 'AccordionItem';
