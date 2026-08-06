"use client";

import { useIntelligenceReport, type GeographyReport, type IntelligenceDashboardFilters } from "./types";

export function useGeography(filters: IntelligenceDashboardFilters) {
  return useIntelligenceReport<GeographyReport>(
    "/api/admin/resource-guide/intelligence/geography",
    filters
  );
}
