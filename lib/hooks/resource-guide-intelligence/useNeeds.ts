"use client";

import { useIntelligenceReport, type IntelligenceDashboardFilters, type NeedReportItem } from "./types";

export function useNeeds(filters: IntelligenceDashboardFilters) {
  return useIntelligenceReport<NeedReportItem[]>(
    "/api/admin/resource-guide/intelligence/needs",
    filters
  );
}
