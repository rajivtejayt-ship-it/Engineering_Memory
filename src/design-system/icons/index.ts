import { LucideProps } from 'lucide-react';

/**
 * Global Icon Configuration
 * Enforces the "Outline Only" rule defined in the Design System.
 */

export const defaultIconProps: Partial<LucideProps> = {
  strokeWidth: 1.5,
  fill: 'none', // Strictly outline
};
