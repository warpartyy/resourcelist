import type { OrganizationCandidate } from "./candidate";

export type OrganizationDuplicateSignal =
  | "exact_organization_name"
  | "website"
  | "phone"
  | "address"
  | "alias"
  | "fuzzy_organization_match";

export type OrganizationDuplicateCheck = {
  candidate: OrganizationCandidate;
  signals: OrganizationDuplicateSignal[];
  duplicateConfidence: number;
  alreadyInDirectory: boolean;
};

export function checkOrganizationDuplicate(
  candidate: OrganizationCandidate,
): OrganizationDuplicateCheck {
  return {
    candidate,
    signals: [],
    duplicateConfidence: candidate.duplicateConfidence,
    alreadyInDirectory: candidate.alreadyInDirectory,
  };
}

export function dedupeOrganizationCandidates(
  candidates: OrganizationCandidate[],
): OrganizationCandidate[] {
  const seen = new Set<string>();

  return candidates.filter((candidate) => {
    const key = [
      candidate.organization.toLowerCase().trim(),
      candidate.website?.toLowerCase().trim(),
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
