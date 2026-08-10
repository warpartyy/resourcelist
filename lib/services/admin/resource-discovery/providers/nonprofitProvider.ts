import {
  emptyOrganizationDiscoveryResult,
  emptyProviderResult,
  getProviderMetadata,
  type EvidenceProviderResult,
  type OrganizationDiscoveryResult,
  type ResourceDiscoveryEvidenceProvider,
} from "./baseProvider";
import { getProviderPriority } from "../evidence-acquisition/providerPriority";

export const nonprofitProvider: ResourceDiscoveryEvidenceProvider = {
  name: "Nonprofit Provider",
  version: "v1",
  priority: getProviderPriority("nonprofit"),
  type: "nonprofit",
  supportsDiscovery: true,
  supportsEvidenceCollection: true,
  getMetadata() {
    return getProviderMetadata(this);
  },
  async discoverOrganizations(): Promise<OrganizationDiscoveryResult> {
    return emptyOrganizationDiscoveryResult(this);
  },
  async collectEvidence(): Promise<EvidenceProviderResult> {
    return emptyProviderResult(this);
  },
};
