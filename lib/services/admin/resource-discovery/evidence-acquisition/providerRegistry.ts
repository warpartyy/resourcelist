import { aiWebDiscoveryProvider } from "../providers/aiWebDiscoveryProvider";
import { governmentProvider } from "../providers/governmentProvider";
import { healthSystemProvider } from "../providers/healthSystemProvider";
import { nonprofitProvider } from "../providers/nonprofitProvider";
import { officialWebsiteProvider } from "../providers/officialWebsiteProvider";
import { tribalWebsiteProvider } from "../providers/tribalWebsiteProvider";
import type {
  EvidenceProviderType,
  ResourceDiscoveryProviderMetadata,
  ResourceDiscoveryEvidenceProvider,
} from "../providers/baseProvider";

export type RegisteredEvidenceProvider = {
  provider: ResourceDiscoveryEvidenceProvider;
  enabled: boolean;
};

const REGISTERED_PROVIDERS: RegisteredEvidenceProvider[] = [
  {
    provider: aiWebDiscoveryProvider,
    enabled: true,
  },
  {
    provider: officialWebsiteProvider,
    enabled: false,
  },
  {
    provider: tribalWebsiteProvider,
    enabled: false,
  },
  {
    provider: governmentProvider,
    enabled: false,
  },
  {
    provider: nonprofitProvider,
    enabled: false,
  },
  {
    provider: healthSystemProvider,
    enabled: false,
  },
];

export function listRegisteredEvidenceProviders(): RegisteredEvidenceProvider[] {
  return REGISTERED_PROVIDERS;
}

export function listEnabledEvidenceProviders(): ResourceDiscoveryEvidenceProvider[] {
  return REGISTERED_PROVIDERS.filter((entry) => entry.enabled).map(
    (entry) => entry.provider,
  );
}

export function listEnabledDiscoveryProviders(): ResourceDiscoveryEvidenceProvider[] {
  return REGISTERED_PROVIDERS.filter(
    (entry) => entry.enabled && entry.provider.supportsDiscovery,
  ).map((entry) => entry.provider);
}

export function listProviderMetadata(): ResourceDiscoveryProviderMetadata[] {
  return REGISTERED_PROVIDERS.map((entry) => entry.provider.getMetadata());
}

export function getEvidenceProviderByType(
  type: EvidenceProviderType,
): ResourceDiscoveryEvidenceProvider | undefined {
  return REGISTERED_PROVIDERS.find((entry) => entry.provider.type === type)
    ?.provider;
}
