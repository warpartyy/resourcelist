"use client";

import { useIntelligenceReport, type IntelligenceDashboardFilters, type QualityReport } from "./types";

export function useQuality(filters: IntelligenceDashboardFilters) {
  return useIntelligenceReport<QualityReport>(
    "/api/admin/resource-guide/intelligence/quality",
    filters
  );
}
