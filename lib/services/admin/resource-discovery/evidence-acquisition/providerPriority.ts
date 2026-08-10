import type { EvidenceProviderType } from "../providers/baseProvider";
import type { CandidateSourceType } from "../evidence/candidateSource";

export type ProviderPriorityName =
  | "Official Website"
  | "Tribal Government"
  | "State Government"
  | "Federal Government"
  | "Tribal Health"
  | "County Government"
  | "Nonprofit"
  | "Community Directory";

export const PROVIDER_PRIORITIES: Record<ProviderPriorityName, number> = {
  "Official Website": 100,
  "Tribal Government": 95,
  "State Government": 90,
  "Federal Government": 90,
  "Tribal Health": 90,
  "County Government": 85,
  Nonprofit: 80,
  "Community Directory": 60,
};

export function getProviderPriority(
  sourceType: CandidateSourceType | EvidenceProviderType,
): number {
  switch (sourceType) {
    case "official_website":
      return PROVIDER_PRIORITIES["Official Website"];
    case "tribal_website":
      return PROVIDER_PRIORITIES["Tribal Government"];
    case "government":
      return PROVIDER_PRIORITIES["State Government"];
    case "health_system":
      return PROVIDER_PRIORITIES["Tribal Health"];
    case "nonprofit":
      return PROVIDER_PRIORITIES.Nonprofit;
    case "directory":
    case "community_directory":
      return PROVIDER_PRIORITIES["Community Directory"];
    default:
      return 0;
  }
}
