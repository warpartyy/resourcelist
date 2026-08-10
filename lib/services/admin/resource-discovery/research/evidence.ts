import type { ResourceDiscoveryConfidence } from "../types";

export type EvidenceType =
  | "official_website"
  | "tribal_website"
  | "government"
  | "nonprofit"
  | "health_system"
  | "directory"
  | "directory_listing"
  | "service_description"
  | "contact_information"
  | "geographic_match"
  | "eligibility_information"
  | "other";

export type EvidenceItem = {
  source: string;
  title: string;
  url?: string;
  organization?: string;
  evidenceType: EvidenceType;
  confidence: ResourceDiscoveryConfidence;
  verified: boolean;
};
