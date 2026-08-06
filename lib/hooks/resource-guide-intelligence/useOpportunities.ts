"use client";

import { useIntelligenceReport, type IntelligenceDashboardFilters, type OpportunityReportItem } from "./types";

export function useOpportunities(filters: IntelligenceDashboardFilters) {
  return useIntelligenceReport<OpportunityReportItem[]>(
    "/api/admin/resource-guide/intelligence/opportunities",
    filters
  );
}
