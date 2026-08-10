import { calculateEvidenceCompleteness } from "../evidence/completeness";
import {
  dedupeNormalizedEvidence,
  detectDuplicateOrganization,
} from "../evidence/duplicates";
import { normalizeCandidateSources } from "../evidence/normalizer";
import type { ResourceDiscoveryResearchResult } from "../evidence/researchResult";
import type { EvidenceProviderResult } from "../providers/baseProvider";
import { calculateDiscoveryConfidence } from "../research/confidence";
import type { ResearchPlan } from "../research/researchPlan";
import { ResourceDiscoveryResearchStatus } from "../types";
import { detectEvidenceConflicts, type ConflictDetectionResult } from "./conflicts";
import { evaluateEvidenceFreshness } from "./freshness";
import { getProviderPriority } from "./providerPriority";
import { listEnabledEvidenceProviders } from "./providerRegistry";
import {
  evaluateNormalizedEvidenceQuality,
  type EvidenceQuality,
} from "./quality";

export type EvidenceAcquisitionInput = {
  plan: ResearchPlan;
};

export type EvidenceAcquisitionResearchResult =
  ResourceDiscoveryResearchResult & {
    provider?: string;
    providerPriority?: number;
    quality: EvidenceQuality;
    lastVerified?: string;
    isOfficial: boolean;
    isPrimarySource: boolean;
    conflicts: ConflictDetectionResult;
    freshness: ReturnType<typeof evaluateEvidenceFreshness>;
  };

export type EvidenceAcquisitionResult = {
  plan: ResearchPlan;
  providerResults: EvidenceProviderResult[];
  researchResults: EvidenceAcquisitionResearchResult[];
  stages: string[];
};

export async function acquireEvidenceForResearchPlan({
  plan,
}: EvidenceAcquisitionInput): Promise<EvidenceAcquisitionResult> {
  const providers = listEnabledEvidenceProviders();
  const providerResults = await Promise.all(
    providers.map((provider) => provider.collectEvidence(plan)),
  );
  const sources = providerResults
    .flatMap((result) => result.sources)
    .map((source) => ({
      ...source,
      providerPriority:
        source.providerPriority ?? getProviderPriority(source.sourceType),
    }));
  const normalizedEvidence = dedupeNormalizedEvidence(
    normalizeCandidateSources(sources),
  );

  return {
    plan,
    providerResults,
    researchResults: normalizedEvidence.map((evidence) => {
      const completeness = calculateEvidenceCompleteness(evidence);
      const duplicate = detectDuplicateOrganization();
      const source = evidence.sources[0];
      const conflicts = detectEvidenceConflicts();

      return {
        organization: evidence.organization,
        evidence: evidence.evidence,
        completeness: completeness.score,
        confidence: calculateDiscoveryConfidence({
          website: evidence.website,
          phone: evidence.phone,
          address: evidence.address,
          services: evidence.services,
          countiesServed: evidence.coverageArea,
          evidence: evidence.evidence,
          geographyMatches: evidence.coverageArea.length > 0,
          categoryMatches: evidence.services.length > 0,
        }),
        duplicateStatus: duplicate.status,
        researchStatus: ResourceDiscoveryResearchStatus.EvidenceCollected,
        nextRecommendedAction: "Review Evidence",
        provider: source?.provider,
        providerPriority: source?.providerPriority,
        quality: evaluateNormalizedEvidenceQuality(
          evidence,
          completeness.score,
        ),
        lastVerified: source?.lastVerified,
        isOfficial: Boolean(source?.isOfficial),
        isPrimarySource: Boolean(source?.isPrimarySource),
        conflicts,
        freshness: evaluateEvidenceFreshness(source?.lastVerified),
      };
    }),
    stages: [
      "Research Plan",
      "Search Strategy",
      "Evidence Acquisition",
      "Normalize",
      "Conflict Detection",
      "Completeness",
      "Confidence",
      "AI Summary",
      "Administrator Review",
    ],
  };
}
