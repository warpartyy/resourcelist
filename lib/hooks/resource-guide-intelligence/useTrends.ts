"use client";

import { useMemo } from "react";
import { useIntelligenceReport, type IntelligenceDashboardFilters, type TrendsReport } from "./types";

export function useTrends(filters: IntelligenceDashboardFilters) {
  const endpoint = useMemo(
    () =>
      `/api/admin/resource-guide/intelligence/trends?range=${
        filters.dateRange === "all" ? "90d" : filters.dateRange
      }`,
    [filters.dateRange]
  );

  return useIntelligenceReport<TrendsReport>(endpoint, filters);
}
