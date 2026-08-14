import type {
  MonthlyImpactReportSummary,
  WeeklyDigestSummary,
} from "../digest/types";

export type EngagementReportingSummary = {
  weeklyDigest: WeeklyDigestSummary;
  monthlyImpactReport: MonthlyImpactReportSummary;
};

export function createEmptyEngagementReportingSummary(): EngagementReportingSummary {
  return {
    weeklyDigest: {
      newResourcesSubmitted: 0,
      updateSuggestions: 0,
      eventSubmissions: 0,
      resourcesApproved: 0,
      resourcesRejected: 0,
      resourcesRestored: 0,
      resourceDiscoveryOpportunities: 0,
      totalSearches: 0,
      helpfulRate: 0,
      largestGap: null,
      highestDemandCategory: null,
      topSearchedCategories: [],
    },
    monthlyImpactReport: {
      totalSearches: 0,
      helpfulRate: 0,
      resourcesAdded: 0,
      resourcesApproved: 0,
      tribalResourcesAdded: 0,
      contributors: 0,
      resourcesVerified: 0,
      updateSuggestions: 0,
      topUnmetNeeds: [],
      largestImprovementSinceLastMonth: null,
    },
  };
}
