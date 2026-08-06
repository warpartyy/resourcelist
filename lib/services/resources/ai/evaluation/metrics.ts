import type { ResourceSearchResult } from "@/lib/services/resources/intelligence/searchEngine";

export function calculateResponseLength(response: string): number {
  return response.trim().length;
}

export function calculateHighConfidenceRatio(results: ResourceSearchResult[]): number {
  if (results.length === 0) {
    return 0;
  }

  const highConfidenceCount = results.filter(
    (result) => result.confidence === "high"
  ).length;

  return highConfidenceCount / results.length;
}

export function calculateAverageScore(results: ResourceSearchResult[]): number {
  if (results.length === 0) {
    return 0;
  }

  const totalScore = results.reduce((sum, result) => sum + result.score, 0);

  return totalScore / results.length;
}
