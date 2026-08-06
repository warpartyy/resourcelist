import type { AdvisorPriority } from "./types";

const PRIORITY_WEIGHT: Record<AdvisorPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function getPriorityForOpportunity({
  searches,
  helpfulRate,
  averageRecommendations,
  clarificationRate,
}: {
  searches: number;
  helpfulRate: number;
  averageRecommendations: number;
  clarificationRate: number;
}): AdvisorPriority {
  if (
    searches >= 25 &&
    (helpfulRate < 0.25 ||
      averageRecommendations < 1 ||
      clarificationRate >= 0.5)
  ) {
    return "critical";
  }

  if (
    searches >= 10 &&
    (helpfulRate < 0.4 ||
      averageRecommendations < 2 ||
      clarificationRate >= 0.35)
  ) {
    return "high";
  }

  if (
    searches >= 5 &&
    (helpfulRate < 0.6 ||
      averageRecommendations < 3 ||
      clarificationRate >= 0.2)
  ) {
    return "medium";
  }

  return "low";
}

export function getPriorityForRate(value: number): AdvisorPriority {
  if (value >= 0.5) return "critical";
  if (value >= 0.35) return "high";
  if (value >= 0.2) return "medium";
  return "low";
}

export function getPriorityWeight(priority: AdvisorPriority): number {
  return PRIORITY_WEIGHT[priority];
}

export function sortByPriority<T extends { priority: AdvisorPriority }>(
  items: T[]
): T[] {
  return [...items].sort(
    (left, right) =>
      getPriorityWeight(right.priority) - getPriorityWeight(left.priority)
  );
}
