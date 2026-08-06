"use client";

import { useIntelligenceReport, type IntelligenceDashboardFilters, type ResourcePerformanceReport } from "./types";

export function useResources(filters: IntelligenceDashboardFilters) {
  return useIntelligenceReport<ResourcePerformanceReport>(
    "/api/admin/resource-guide/intelligence/resources",
    filters
  );
}
