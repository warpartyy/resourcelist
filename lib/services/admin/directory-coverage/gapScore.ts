import type { CoverageLevel, GapLevel } from "./types";

export const GAP_SCORE_WEIGHTS = {
  searchDemand: 0.4,
  coverage: 0.3,
  helpfulRate: 0.2,
  recommendationRate: 0.1,
} as const;

export type GapScoreInput = {
  searchCount: number;
  resourceCount: number;
  helpfulRate: number;
  recommendationCount: number;
  maxSearchCount: number;
  maxResourceCount: number;
  maxRecommendationCount: number;
};

export function calculateGapScore({
  searchCount,
  resourceCount,
  helpfulRate,
  recommendationCount,
  maxSearchCount,
  maxResourceCount,
  maxRecommendationCount,
}: GapScoreInput): { score: number; reasons: string[] } {
  const searchDemand = normalize(searchCount, maxSearchCount);
  const coverageGap = 1 - normalize(resourceCount, maxResourceCount);
  const helpfulGap = 1 - clamp(helpfulRate);
  const recommendationGap = 1 - normalize(
    recommendationCount,
    maxRecommendationCount
  );
  const score =
    (searchDemand * GAP_SCORE_WEIGHTS.searchDemand +
      coverageGap * GAP_SCORE_WEIGHTS.coverage +
      helpfulGap * GAP_SCORE_WEIGHTS.helpfulRate +
      recommendationGap * GAP_SCORE_WEIGHTS.recommendationRate) *
    100;

  return {
    score: Math.round(score),
    reasons: buildGapReasons({
      searchDemand,
      coverageGap,
      helpfulGap,
      recommendationGap,
    }),
  };
}

export function getCoverageLevel(resourceCount: number): CoverageLevel {
  if (resourceCount >= 100) return "Excellent";
  if (resourceCount >= 50) return "Strong";
  if (resourceCount >= 20) return "Moderate";
  if (resourceCount >= 10) return "Needs Growth";

  return "Critical Gap";
}

export function getGapLevel(score: number): GapLevel {
  if (score >= 81) return "Critical Opportunity";
  if (score >= 61) return "High Priority";
  if (score >= 41) return "Growing Need";
  if (score >= 21) return "Monitor";

  return "Well Covered";
}

function buildGapReasons({
  searchDemand,
  coverageGap,
  helpfulGap,
  recommendationGap,
}: {
  searchDemand: number;
  coverageGap: number;
  helpfulGap: number;
  recommendationGap: number;
}) {
  const reasons: string[] = [];

  if (searchDemand >= 0.6) {
    reasons.push("High search demand");
  }

  if (coverageGap >= 0.6) {
    reasons.push("Low directory coverage");
  }

  if (helpfulGap >= 0.5) {
    reasons.push("Lower helpful rate");
  }

  if (recommendationGap >= 0.6) {
    reasons.push("Low recommendation frequency");
  }

  return reasons.length > 0 ? reasons : ["Coverage and demand appear balanced"];
}

function normalize(value: number, max: number) {
  if (max <= 0) {
    return 0;
  }

  return clamp(value / max);
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}
