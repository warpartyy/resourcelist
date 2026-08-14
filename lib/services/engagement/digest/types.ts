export type WeeklyDigestSummary = {
  newResourcesSubmitted: number;
  updateSuggestions: number;
  eventSubmissions: number;
  resourcesApproved: number;
  resourcesRejected: number;
  resourcesRestored: number;
  resourceDiscoveryOpportunities: number;
  totalSearches: number;
  helpfulRate: number;
  largestGap: string | null;
  highestDemandCategory: string | null;
  topSearchedCategories: string[];
};

export type MonthlyImpactReportSummary = {
  totalSearches: number;
  helpfulRate: number;
  resourcesAdded: number;
  resourcesApproved: number;
  tribalResourcesAdded: number;
  contributors: number;
  resourcesVerified: number;
  updateSuggestions: number;
  topUnmetNeeds: string[];
  largestImprovementSinceLastMonth: string | null;
};
