import type { NormalizedEvidence } from "./normalizer";

export type EvidenceCompletenessBreakdown = {
  officialWebsite: number;
  phone: number;
  address: number;
  services: number;
  eligibility: number;
  coverageArea: number;
};

export type EvidenceCompletenessResult = {
  score: number;
  breakdown: EvidenceCompletenessBreakdown;
};

export function calculateEvidenceCompleteness(
  evidence: NormalizedEvidence,
): EvidenceCompletenessResult {
  const breakdown: EvidenceCompletenessBreakdown = {
    officialWebsite: evidence.website ? 20 : 0,
    phone: evidence.phone ? 15 : 0,
    address: evidence.address ? 15 : 0,
    services: evidence.services.length > 0 ? 25 : 0,
    eligibility: evidence.eligibility ? 15 : 0,
    coverageArea: evidence.coverageArea.length > 0 ? 10 : 0,
  };

  return {
    score: Object.values(breakdown).reduce((total, value) => total + value, 0),
    breakdown,
  };
}
