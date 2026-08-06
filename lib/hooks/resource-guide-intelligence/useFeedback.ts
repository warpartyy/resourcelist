"use client";

import { useIntelligenceReport, type FeedbackReport, type IntelligenceDashboardFilters } from "./types";

export function useFeedback(filters: IntelligenceDashboardFilters) {
  return useIntelligenceReport<FeedbackReport>(
    "/api/admin/resource-guide/intelligence/feedback",
    filters
  );
}
