import {
  officialWebsiteProvider,
} from "../providers/officialWebsiteProvider";
import { tribalWebsiteProvider } from "../providers/tribalWebsiteProvider";
import { governmentProvider } from "../providers/governmentProvider";
import { nonprofitProvider } from "../providers/nonprofitProvider";
import type {
  EvidenceProviderResult,
  ResourceDiscoveryEvidenceProvider,
} from "../providers/baseProvider";
import { calculateDiscoveryConfidence } from "../research/confidence";
import type { ResearchPlan } from "../research/researchPlan";
import { ResourceDiscoveryResearchStatus } from "../types";
import { calculateEvidenceCompleteness } from "./completeness";
import {
  dedupeNormalizedEvidence,
  detectDuplicateOrganization,
} from "./duplicates";
import { normalizeCandidateSources } from "./normalizer";
import type { ResourceDiscoveryResearchResult } from "./researchResult";

export type EvidenceCollectionPipelineInput = {
  plan: ResearchPlan;
  providers?: ResourceDiscoveryEvidenceProvider[];
};

export type EvidenceCollectionPipelineResult = {
  plan: ResearchPlan;
  providerResults: EvidenceProviderResult[];
  researchResults: ResourceDiscoveryResearchResult[];
  stages: string[];
};

const DEFAULT_PROVIDERS: ResourceDiscoveryEvidenceProvider[] = [
  officialWebsiteProvider,
  tribalWebsiteProvider,
  governmentProvider,
  nonprofitProvider,
];

export async function collectEvidenceForResearchPlan({
  plan,
  providers = DEFAULT_PROVIDERS,
}: EvidenceCollectionPipelineInput): Promise<EvidenceCollectionPipelineResult> {
  const providerResults = await Promise.all(
    providers.map((provider) => provider.collectEvidence(plan)),
  );
  const sources = providerResults.flatMap((result) => result.sources);
  const normalizedEvidence = dedupeNormalizedEvidence(
    normalizeCandidateSources(sources),
  );

  return {
    plan,
    providerResults,
    researchResults: normalizedEvidence.map((evidence) => {
      const completeness = calculateEvidenceCompleteness(evidence);
      const duplicate = detectDuplicateOrganization();

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
      };
    }),
    stages: [
      "Research Plan",
      "Search Strategy",
      "Evidence Providers",
      "Normalize Evidence",
      "Deduplicate",
      "Confidence Evaluation",
      "Ready For AI Review",
    ],
  };
}
