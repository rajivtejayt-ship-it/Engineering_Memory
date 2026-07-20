'use client';

import * as React from 'react';
import { MotionConfig } from 'framer-motion';

/**
 * Global Motion Provider
 * Configures framer-motion defaults, specifically enforcing 
 * reduced-motion handling at the provider level for accessibility.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}
