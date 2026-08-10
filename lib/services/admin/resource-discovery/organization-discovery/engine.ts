import { listEnabledDiscoveryProviders } from "../evidence-acquisition/providerRegistry";
import type { ResourceDiscoveryEvidenceProvider } from "../providers/baseProvider";
import type { ResearchPlan } from "../research/researchPlan";
import type { SearchStrategy } from "../research/searchStrategies";
import type { OrganizationCandidate } from "./candidate";
import {
  checkOrganizationDuplicate,
  dedupeOrganizationCandidates,
} from "./duplicates";

export type OrganizationDiscoveryEngineInput = {
  plan: ResearchPlan;
  searchStrategies?: SearchStrategy[];
  providers?: ResourceDiscoveryEvidenceProvider[];
};

export type OrganizationDiscoveryEngineResult = {
  plan: ResearchPlan;
  candidates: OrganizationCandidate[];
  providerCount: number;
  searchPhraseCount: number;
};

export async function discoverOrganizationsForResearchPlan({
  plan,
  searchStrategies = plan.searchStrategies,
  providers = listEnabledDiscoveryProviders(),
}: OrganizationDiscoveryEngineInput): Promise<OrganizationDiscoveryEngineResult> {
  const discovered = await Promise.all(
    providers.map((provider) =>
      provider.discoverOrganizations({
        plan,
        searchStrategies,
      }),
    ),
  );
  const candidates = dedupeOrganizationCandidates(
    discovered.flatMap((result) => result.candidates),
  ).map((candidate) => {
    const duplicateCheck = checkOrganizationDuplicate(candidate);

    return {
      ...candidate,
      alreadyInDirectory: duplicateCheck.alreadyInDirectory,
      duplicateConfidence: duplicateCheck.duplicateConfidence,
    };
  });

  return {
    plan,
    candidates,
    providerCount: providers.length,
    searchPhraseCount: searchStrategies.length,
  };
}
