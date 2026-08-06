"use client";

import { useIntelligenceReport, type IntelligenceDashboardFilters, type OverviewReport } from "./types";

export function useOverview(filters: IntelligenceDashboardFilters) {
  return useIntelligenceReport<OverviewReport>(
    "/api/admin/resource-guide/intelligence/overview",
    filters
  );
}
