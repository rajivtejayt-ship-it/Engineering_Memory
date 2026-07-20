/**
 * Core Motion Primitives
 * Exporting standard transition configurations to ensure consistency across the application.
 */

export const transitions = {
  /**
   * Default Interaction (180ms)
   * Used for hover states, active states, fast UI feedback.
   */
  interaction: {
    type: 'tween',
    duration: 0.18,
    ease: [0.4, 0, 0.2, 1], // standard easing
  },

  /**
   * Structural Reveal (280ms)
   * Used for page transitions, mounting large components, entering view.
   */
  structural: {
    type: 'tween',
    duration: 0.28,
    ease: [0.4, 0, 0.2, 1], // standard easing
  },
} as const;

export const variants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: transitions.interaction },
    exit: { opacity: 0, transition: transitions.interaction },
  },
  slideUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: transitions.structural },
    exit: { opacity: 0, y: -10, transition: transitions.interaction },
  },
};
