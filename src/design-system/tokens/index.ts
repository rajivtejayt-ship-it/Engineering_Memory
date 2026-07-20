/**
 * Core Design System Tokens
 * Do NOT use these values directly in CSS (prefer semantic CSS variables).
 * Use these for JS-based styling (e.g. Canvas, Charts, or inline styled components).
 */

export const colors = {
  background: {
    base: 'var(--bg-base)',
    panel: 'var(--bg-panel)',
    card: 'var(--bg-card)',
    input: 'var(--bg-input)',
  },
  text: {
    primary: 'var(--text)',
    secondary: 'var(--text-secondary)',
  },
  accent: {
    blue: 'var(--accent)',
    green: 'var(--success)',
  },
  status: {
    success: 'var(--success)',
    warning: 'var(--warning)',
    danger: 'var(--danger)',
  },
} as const;

export const spacing = {
  1: '4px',
  2: '8px',
  4: '16px',
  6: '24px',
  8: '32px',
  16: '64px',
} as const;

export const radius = {
  btn: '6px',
  card: '8px',
  panel: '12px',
  dialog: '16px',
} as const;
