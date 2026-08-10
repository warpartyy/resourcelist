import type { CandidateSource } from "../evidence/candidateSource";
import type { NormalizedEvidence } from "../evidence/normalizer";

export type EvidenceQuality = "Excellent" | "High" | "Moderate" | "Low";

export type EvidenceQualityInput = {
  source: CandidateSource;
  matchingSourceCount?: number;
  completeness?: number;
};

export function evaluateEvidenceQuality({
  source,
  matchingSourceCount = 1,
  completeness = 0,
}: EvidenceQualityInput): EvidenceQuality {
  let score = 0;

  if (source.isOfficial) score += 25;
  if (source.url.startsWith("https://")) score += 15;
  if (source.isPrimarySource) score += 20;
  if (matchingSourceCount > 1) score += 15;
  if (source.lastVerified) score += 10;
  if (completeness >= 70) score += 15;

  if (score >= 80) return "Excellent";
  if (score >= 60) return "High";
  if (score >= 35) return "Moderate";
  return "Low";
}

export function evaluateNormalizedEvidenceQuality(
  evidence: NormalizedEvidence,
  completeness: number,
): EvidenceQuality {
  const source = evidence.sources[0];

  if (!source) {
    return "Low";
  }

  return evaluateEvidenceQuality({
    source,
    matchingSourceCount: evidence.sources.length,
    completeness,
  });
}
