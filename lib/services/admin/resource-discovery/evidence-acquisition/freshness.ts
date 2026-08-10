export type EvidenceFreshness = "Fresh" | "Aging" | "Stale" | "Unknown";

export type EvidenceFreshnessResult = {
  freshness: EvidenceFreshness;
  ageInDays?: number;
  staleThresholdDays: number;
};

export const DEFAULT_STALE_THRESHOLD_DAYS = 365;

export function evaluateEvidenceFreshness(
  lastVerified?: string,
  now: Date = new Date(),
  staleThresholdDays = DEFAULT_STALE_THRESHOLD_DAYS,
): EvidenceFreshnessResult {
  if (!lastVerified) {
    return {
      freshness: "Unknown",
      staleThresholdDays,
    };
  }

  const verifiedAt = new Date(lastVerified);
  if (Number.isNaN(verifiedAt.getTime())) {
    return {
      freshness: "Unknown",
      staleThresholdDays,
    };
  }

  const ageInDays = Math.max(
    0,
    Math.floor((now.getTime() - verifiedAt.getTime()) / 86_400_000),
  );

  if (ageInDays > staleThresholdDays) {
    return {
      freshness: "Stale",
      ageInDays,
      staleThresholdDays,
    };
  }

  if (ageInDays > staleThresholdDays / 2) {
    return {
      freshness: "Aging",
      ageInDays,
      staleThresholdDays,
    };
  }

  return {
    freshness: "Fresh",
    ageInDays,
    staleThresholdDays,
  };
}
