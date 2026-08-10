import type { EvidenceQuality } from "../evidence-acquisition/quality";

export type CandidateSourceType =
  | "official_website"
  | "tribal_website"
  | "government"
  | "nonprofit"
  | "health_system"
  | "directory"
  | "other";

export type CandidateSource = {
  sourceType: CandidateSourceType;
  organization: string;
  title: string;
  url: string;
  collectedAt: string;
  provider?: string;
  providerPriority?: number;
  quality?: EvidenceQuality;
  lastVerified?: string;
  isOfficial?: boolean;
  isPrimarySource?: boolean;
  verified: boolean;
};
