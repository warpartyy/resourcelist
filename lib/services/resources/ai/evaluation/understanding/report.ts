import type {
  UnderstandingConfidenceLevel,
  UnderstandingConfidenceReport,
  UnderstandingConfidenceReason,
} from "./types";

export const UNDERSTANDING_CONFIDENCE_THRESHOLDS = {
  high: 80,
  medium: 60,
  clarification: 60,
} as const;

export function getUnderstandingConfidenceLevel(
  score: number
): UnderstandingConfidenceLevel {
  if (score >= UNDERSTANDING_CONFIDENCE_THRESHOLDS.high) {
    return "High";
  }

  if (score >= UNDERSTANDING_CONFIDENCE_THRESHOLDS.medium) {
    return "Medium";
  }

  return "Low";
}

export function buildUnderstandingConfidenceReport(
  score: number,
  reasons: UnderstandingConfidenceReason[]
): UnderstandingConfidenceReport {
  const roundedScore = Math.round(Math.min(100, Math.max(0, score)));

  return {
    score: roundedScore,
    level: getUnderstandingConfidenceLevel(roundedScore),
    requiresClarification:
      roundedScore < UNDERSTANDING_CONFIDENCE_THRESHOLDS.clarification,
    reasons,
  };
}
