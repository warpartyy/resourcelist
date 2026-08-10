import type { ResearchPlan } from "../research/researchPlan";
import type { CandidateSource } from "../evidence/candidateSource";
import type { OrganizationCandidate } from "../organization-discovery/candidate";
import type { SearchStrategy } from "../research/searchStrategies";

export type EvidenceProviderType =
  | "official_website"
  | "tribal_website"
  | "government"
  | "nonprofit"
  | "health_system"
  | "community_directory"
  | "other";

export type EvidenceProviderResult = {
  providerName: string;
  providerType: EvidenceProviderType;
  sources: CandidateSource[];
};

export type OrganizationDiscoveryInput = {
  plan: ResearchPlan;
  searchStrategies: SearchStrategy[];
};

export type OrganizationDiscoveryResult = {
  providerName: string;
  providerType: EvidenceProviderType;
  candidates: OrganizationCandidate[];
};

export type ResourceDiscoveryProviderMetadata = {
  name: string;
  version: string;
  priority: number;
  type: EvidenceProviderType;
  supportsDiscovery: boolean;
  supportsEvidenceCollection: boolean;
};

export interface ResourceDiscoveryEvidenceProvider {
  name: string;
  version: string;
  priority: number;
  type: EvidenceProviderType;
  supportsDiscovery: boolean;
  supportsEvidenceCollection: boolean;
  getMetadata(): ResourceDiscoveryProviderMetadata;
  discoverOrganizations(
    input: OrganizationDiscoveryInput,
  ): Promise<OrganizationDiscoveryResult>;
  collectEvidence(plan: ResearchPlan): Promise<EvidenceProviderResult>;
}

export function emptyProviderResult(
  provider: Pick<ResourceDiscoveryEvidenceProvider, "name" | "type">,
): EvidenceProviderResult {
  return {
    providerName: provider.name,
    providerType: provider.type,
    sources: [],
  };
}

export function emptyOrganizationDiscoveryResult(
  provider: Pick<ResourceDiscoveryEvidenceProvider, "name" | "type">,
): OrganizationDiscoveryResult {
  return {
    providerName: provider.name,
    providerType: provider.type,
    candidates: [],
  };
}

export function getProviderMetadata(
  provider: Pick<
    ResourceDiscoveryEvidenceProvider,
    | "name"
    | "version"
    | "priority"
    | "type"
    | "supportsDiscovery"
    | "supportsEvidenceCollection"
  >,
): ResourceDiscoveryProviderMetadata {
  return {
    name: provider.name,
    version: provider.version,
    priority: provider.priority,
    type: provider.type,
    supportsDiscovery: provider.supportsDiscovery,
    supportsEvidenceCollection: provider.supportsEvidenceCollection,
  };
}
