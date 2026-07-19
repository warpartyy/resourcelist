import type { Json, Tables } from "@/lib/database.types";

export type ImpactType =
  | "resource_approved"
  | "resource_verified"
  | "resource_improved"
  | "update_request_resolved"
  | "duplicate_merged";

export type ImpactCategory =
  | "approval"
  | "verification"
  | "improvement"
  | "maintenance";

export type ImpactSource =
  | "manual"
  | "suggested_improvement"
  | "update_request"
  | "duplicate_merge"
  | "bulk_import"
  | "api";

export type ImprovementActivityKey =
  | "phone"
  | "website"
  | "address"
  | "services"
  | "description"
  | "eligibility"
  | "counties"
  | "email"
  | "application_link"
  | "tags"
  | "subcategories"
  | "last_verified";

export type ImpactRuleKey =
  | "resource_approved"
  | "resource_verified"
  | "update_request_resolved"
  | "duplicate_merged"
  | "phone_added"
  | "website_added"
  | "address_added"
  | "services_added"
  | "description_added"
  | "eligibility_added"
  | "counties_added"
  | "email_added"
  | "application_link_added"
  | "tags_added"
  | "subcategories_added"
  | "last_verified_updated";

export type ImpactRule = {
  points: number;
  title: string;
  description: string;
  category: ImpactCategory;
};

export type ImpactLog = Tables<"impact_log">;

export type ImpactMetadata = Json;

export type DashboardImpactSummary = {
  impactPoints: number;
  totalContributions: number;
  thisWeek: number;
};

export type CommunityImpactSummary = {
  totalImpactPoints: number;
  totalImprovements: number;
  activeAdmins: number;
  directoryCompleteness: number;
};

export type DirectoryMetrics = {
  approvedResources: number;
  verifiedResources: number;
  resourcesMissingPhone: number;
  resourcesMissingWebsite: number;
  resourcesMissingDescription: number;
  resourcesMissingServices: number;
  duplicateResourcesMerged: number;
  completeness: number;
};

export type RecentImpactItem = {
  id: string;
  title: string;
  description: string;
  organization: string;
  points: number;
  createdAt: string;
  source: string | null;
};

export type RecentActivitySummary = {
  my: RecentImpactItem[];
  team: RecentImpactItem[];
};
