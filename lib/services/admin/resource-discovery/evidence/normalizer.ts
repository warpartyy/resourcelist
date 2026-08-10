import type { EvidenceItem } from "../research/evidence";
import type { ResourceDiscoveryConfidence } from "../types";
import type { CandidateSource } from "./candidateSource";

export type NormalizedEvidence = {
  organization?: string;
  website?: string;
  phone?: string;
  address?: string;
  services: string[];
  eligibility?: string;
  coverageArea: string[];
  evidence: EvidenceItem[];
  sources: CandidateSource[];
};

export function normalizeCandidateSources(
  sources: CandidateSource[],
): NormalizedEvidence[] {
  if (sources.length === 0) {
    return [];
  }

  return sources.map((source) => ({
    organization: source.organization,
    website: source.url,
    services: [],
    coverageArea: [],
    evidence: [toEvidenceItem(source)],
    sources: [source],
  }));
}

function toEvidenceItem(source: CandidateSource): EvidenceItem {
  return {
    source: source.sourceType,
    title: source.title,
    url: source.url,
    organization: source.organization,
    evidenceType: source.sourceType,
    confidence: getEvidenceConfidence(source),
    verified: source.verified,
  };
}

function getEvidenceConfidence(source: CandidateSource): ResourceDiscoveryConfidence {
  return source.verified ? "Medium" : "Low";
}
