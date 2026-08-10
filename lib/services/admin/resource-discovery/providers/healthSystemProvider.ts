import {
  emptyOrganizationDiscoveryResult,
  emptyProviderResult,
  getProviderMetadata,
  type EvidenceProviderResult,
  type OrganizationDiscoveryResult,
  type ResourceDiscoveryEvidenceProvider,
} from "./baseProvider";
import { getProviderPriority } from "../evidence-acquisition/providerPriority";

export const healthSystemProvider: ResourceDiscoveryEvidenceProvider = {
  name: "Health System Provider",
  version: "v1",
  priority: getProviderPriority("health_system"),
  type: "health_system",
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
