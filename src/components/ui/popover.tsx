'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { transitions } from '@/design-system/motion';

export interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

export function Popover({
  trigger,
  content,
  align = 'center',
  sideOffset = 8,
}: PopoverProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <div ref={popoverRef} className="relative inline-block">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="cursor-pointer inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded">
        {trigger}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={transitions.interaction}
            style={{ top: `calc(100% + ${sideOffset}px)` }}
            className={cn(
              'absolute z-[var(--z-dropdown)] min-w-[200px] rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-panel)] p-4 shadow-[var(--shadow-lg)]',
              alignmentClasses[align]
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
