import type { CoverageDateRange } from "@/lib/services/admin/directory-coverage/types";
import type { EvidenceConflict } from "./evidence-acquisition/conflicts";
import type { EvidenceFreshness } from "./evidence-acquisition/freshness";
import type { EvidenceQuality } from "./evidence-acquisition/quality";
import type { CandidateSource } from "./evidence/candidateSource";
import type { EvidenceItem } from "./research/evidence";

export type ResourceDiscoveryConfidence = "High" | "Medium" | "Low";

export enum ResourceDiscoveryResearchStatus {
  ResearchPlanned = "Research Planned",
  Researching = "Researching",
  EvidenceCollected = "Evidence Collected",
  ReadyForReview = "Ready for Review",
  NeedsMoreEvidence = "Needs More Evidence",
  Rejected = "Rejected",
}

export type ResourceDiscoveryCandidate = {
  organization: string;
  website?: string;
  phone?: string;
  address?: string;
  services: string[];
  eligibility?: string;
  countiesServed: string[];
  tribalEligibility?: string;
  evidence: EvidenceItem[];
  evidenceSources?: CandidateSource[];
  completeness?: number;
  evidenceQuality?: EvidenceQuality;
  provider?: string;
  providerPriority?: number;
  discoverySource?: string;
  matchedSearchPhrase?: string;
  alreadyInDirectory?: boolean;
  duplicateConfidence?: number;
  nextStep?: string;
  isPrimarySource?: boolean;
  lastVerified?: string;
  freshness?: EvidenceFreshness;
  conflicts?: EvidenceConflict[];
  confidence: ResourceDiscoveryConfidence;
  whySuggested: string;
  researchStatus: ResourceDiscoveryResearchStatus;
};

export type ResourceDiscoveryCandidateAction =
  | "Research"
  | "Create Pending Resource"
  | "Dismiss";

export type ResourceDiscoveryQueueStatus = "Ready for Research";

export type ResourceDiscoveryFilters = {
  dateRange: CoverageDateRange;
  state: string;
  county: string;
  city: string;
  parentCategory: string;
  subcategory: string;
};

export type ResourceDiscoveryQueueItem = {
  id: string;
  priority: number;
  subcategory: string;
  geography: string;
  county?: string;
  gapScore: number;
  searchDemand: number;
  resourceCount: number;
  helpfulRate: number;
  status: ResourceDiscoveryQueueStatus;
};

export type ResourceDiscoveryResearchInput = {
  queueItem: ResourceDiscoveryQueueItem;
  filters: ResourceDiscoveryFilters;
};
