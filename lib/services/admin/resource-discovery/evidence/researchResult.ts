import type {
  ResourceDiscoveryConfidence,
  ResourceDiscoveryResearchStatus,
} from "../types";
import type { EvidenceItem } from "../research/evidence";
import type { DuplicateStatus } from "./duplicates";

export type ResearchNextRecommendedAction =
  | "Collect Evidence"
  | "Review Evidence"
  | "Create Pending Resource"
  | "Needs More Evidence"
  | "Reject";

export type ResourceDiscoveryResearchResult = {
  organization?: string;
  evidence: EvidenceItem[];
  completeness: number;
  confidence: ResourceDiscoveryConfidence;
  duplicateStatus: DuplicateStatus;
  researchStatus: ResourceDiscoveryResearchStatus;
  nextRecommendedAction: ResearchNextRecommendedAction;
};
