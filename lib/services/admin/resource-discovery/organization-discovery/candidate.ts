import type { ResourceDiscoveryConfidence } from "../types";

export interface OrganizationCandidate {
  organization: string;
  discoverySource: string;
  provider: string;
  confidence: ResourceDiscoveryConfidence;
  matchedSearchPhrase: string;
  website?: string;
  alreadyInDirectory: boolean;
  duplicateConfidence: number;
}
