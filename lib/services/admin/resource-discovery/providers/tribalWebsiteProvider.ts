import {
  emptyOrganizationDiscoveryResult,
  emptyProviderResult,
  getProviderMetadata,
  type EvidenceProviderResult,
  type OrganizationDiscoveryResult,
  type ResourceDiscoveryEvidenceProvider,
} from "./baseProvider";
import { getProviderPriority } from "../evidence-acquisition/providerPriority";

export const tribalWebsiteProvider: ResourceDiscoveryEvidenceProvider = {
  name: "Tribal Website Provider",
  version: "v1",
  priority: getProviderPriority("tribal_website"),
  type: "tribal_website",
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
