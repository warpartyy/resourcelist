import {
  emptyOrganizationDiscoveryResult,
  emptyProviderResult,
  getProviderMetadata,
  type EvidenceProviderResult,
  type OrganizationDiscoveryResult,
  type ResourceDiscoveryEvidenceProvider,
} from "./baseProvider";
import { getProviderPriority } from "../evidence-acquisition/providerPriority";

export const governmentProvider: ResourceDiscoveryEvidenceProvider = {
  name: "Government Provider",
  version: "v1",
  priority: getProviderPriority("government"),
  type: "government",
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
