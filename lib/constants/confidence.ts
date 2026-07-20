/** Minimum score for each confidence level, expressed on a 0–1 scale. */
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.5,
  LOW: 0,
} as const;

/** A supported confidence level. */
export type ConfidenceLevel = keyof typeof CONFIDENCE_THRESHOLDS;
