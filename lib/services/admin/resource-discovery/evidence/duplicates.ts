import type { NormalizedEvidence } from "./normalizer";

export type DuplicateStatus =
  | "unknown"
  | "not_duplicate"
  | "possible_duplicate"
  | "duplicate";

export type DuplicateDetectionResult = {
  status: DuplicateStatus;
  matchedOrganization?: string;
  reason?: string;
};

export function detectDuplicateOrganization(): DuplicateDetectionResult {
  return {
    status: "unknown",
    reason: "Duplicate detection is not connected to directory data yet.",
  };
}

export function dedupeNormalizedEvidence(
  evidence: NormalizedEvidence[],
): NormalizedEvidence[] {
  const seen = new Set<string>();

  return evidence.filter((item) => {
    const key = [
      item.organization?.toLowerCase().trim(),
      item.website?.toLowerCase().trim(),
    ]
      .filter(Boolean)
      .join("|");

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
