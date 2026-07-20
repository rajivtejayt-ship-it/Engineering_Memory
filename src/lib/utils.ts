import { clsx, type ClassValue } from 'clsx';

/**
 * Utility for merging Tailwind CSS classes.
 * Since tailwind-merge is not installed, this relies solely on clsx.
 * Be cautious not to pass conflicting Tailwind utility classes (e.g. px-2 px-4)
 * as the behavior will rely entirely on CSS specificity in Tailwind v4.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
