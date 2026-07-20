'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

/**
 * Global Tooltip Provider
 * Configures the delay and behavior for all tooltips in the application.
 */
export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={200} skipDelayDuration={0}>
      {children}
    </TooltipPrimitive.Provider>
  );
}
