import type { CoverageDateRange } from "@/lib/services/admin/directory-coverage/types";
import type { EvidenceConflict } from "./evidence-acquisition/conflicts";
import type { EvidenceFreshness } from "./evidence-acquisition/freshness";
import type { EvidenceQuality } from "./evidence-acquisition/quality";
import type { CandidateSource } from "./evidence/candidateSource";
import type { EvidenceItem } from "./research/evidence";

export type ResourceDiscoveryConfidence = "High" | "Medium" | "Low";
export type ResourceDiscoveryFieldConfidence =
  | ResourceDiscoveryConfidence
  | "Unknown";

export type ResourceDiscoveryFieldConfidenceMap = Partial<
  Record<
    | "organization"
    | "website"
    | "phone"
    | "email"
    | "address"
    | "city"
    | "state"
    | "zip"
    | "services"
    | "description"
    | "eligibility"
    | "tribalEligibility"
    | "countiesServed",
    ResourceDiscoveryFieldConfidence
  >
>;

export enum ResourceDiscoveryResearchStatus {
  ResearchPlanned = "Research Planned",
  Researching = "Researching",
  EvidenceCollected = "Evidence Collected",
  ReadyForReview = "Ready for Review",
  NeedsMoreEvidence = "Needs More Evidence",
  Rejected = "Rejected",
}

export type ResourceDiscoveryCandidate = {
  id?: string;
  sessionId?: string;
  organization: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  description?: string;
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
  fieldConfidence?: ResourceDiscoveryFieldConfidenceMap;
  missingFields?: string[];
  reviewStatus?: ResourceDiscoveryReviewStatus;
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
  subcategoryValue?: string;
  parentCategory?: string;
  geography: string;
  county?: string;
  gapScore: number;
  searchDemand: number;
  resourceCount: number;
  helpfulRate: number;
  status: ResourceDiscoveryQueueStatus;
};

export type ResourceDiscoverySearchScope = "Local" | "Nearby" | "Statewide";

export type ResourceDiscoveryResearchRequest = {
  parentCategory: string;
  subcategory?: string;
  state: string;
  county?: string;
  city?: string;
  scope: ResourceDiscoverySearchScope;
  keywords?: string;
  maximumResults: number;
};

export type ResourceDiscoveryResearchInput = ResourceDiscoveryResearchRequest;

export type ResourceDiscoveryReviewStatus =
  | "New"
  | "Reviewed"
  | "Created"
  | "Dismissed";

export type ResourceDiscoverySessionSummary = {
  id: string;
  createdAt: string;
  createdBy?: string | null;
  parentCategory: string;
  subcategory?: string | null;
  state: string;
  county?: string | null;
  city?: string | null;
  searchScope: ResourceDiscoverySearchScope;
  keywords?: string | null;
  maxResults: number;
  completedAt?: string | null;
};

export type ResourceDiscoverySavedSession = {
  session: ResourceDiscoverySessionSummary;
  candidates: ResourceDiscoveryCandidate[];
};
