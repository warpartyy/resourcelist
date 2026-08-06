"use client";

import { useIntelligenceReport, type ConceptReportItem, type IntelligenceDashboardFilters } from "./types";

export function useConcepts(filters: IntelligenceDashboardFilters) {
  return useIntelligenceReport<ConceptReportItem[]>(
    "/api/admin/resource-guide/intelligence/concepts",
    filters
  );
}
