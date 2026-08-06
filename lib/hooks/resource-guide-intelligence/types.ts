"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ConceptReportItem,
  FeedbackReport,
  GeographyReport,
  NeedReportItem,
  OpportunityReportItem,
  OverviewReport,
  QualityReport,
  ResourcePerformanceItem,
  ResourcePerformanceReport,
  TrendsReport,
} from "@/lib/services/resources/ai/intelligence/reporting/types";

export type IntelligenceDashboardFilters = {
  dateRange: "all" | "today" | "7d" | "30d" | "90d";
  state: string;
  county: string;
  city: string;
  need: string;
  concept: string;
  promptVersion: string;
};

export type ReportEnvelope<T> = {
  generatedAt: string;
  filters: Record<string, string | number>;
  data: T;
};

export type ReportHookResult<T> = {
  data: T | null;
  generatedAt: string | null;
  isLoading: boolean;
  error: string | null;
};

export type {
  ConceptReportItem,
  FeedbackReport,
  GeographyReport,
  NeedReportItem,
  OpportunityReportItem,
  OverviewReport,
  QualityReport,
  ResourcePerformanceItem,
  ResourcePerformanceReport,
  TrendsReport,
};

export const DEFAULT_INTELLIGENCE_FILTERS: IntelligenceDashboardFilters = {
  dateRange: "30d",
  state: "",
  county: "",
  city: "",
  need: "",
  concept: "",
  promptVersion: "",
};

export function useIntelligenceReport<T>(
  endpoint: string,
  filters: IntelligenceDashboardFilters
): ReportHookResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryString = useIntelligenceQueryString(filters);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReport() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(buildReportUrl(endpoint, queryString), {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Report request failed: ${response.status}`);
        }

        const payload = (await response.json()) as ReportEnvelope<T>;
        setData(payload.data);
        setGeneratedAt(payload.generatedAt);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        setError(err instanceof Error ? err.message : "Unable to load report");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadReport();

    return () => controller.abort();
  }, [endpoint, queryString]);

  return { data, generatedAt, isLoading, error };
}

function buildReportUrl(endpoint: string, queryString: string): string {
  if (!queryString) {
    return endpoint;
  }

  return endpoint.includes("?")
    ? `${endpoint}&${queryString.slice(1)}`
    : `${endpoint}${queryString}`;
}

function useIntelligenceQueryString(
  filters: IntelligenceDashboardFilters
): string {
  return useMemo(() => {
    const params = new URLSearchParams();

    if (filters.dateRange !== "all") {
      const startDate = getStartDate(filters.dateRange);
      if (startDate) params.set("startDate", startDate);
    }

    setIfPresent(params, "state", filters.state);
    setIfPresent(params, "county", filters.county);
    setIfPresent(params, "city", filters.city);
    setIfPresent(params, "need", filters.need);
    setIfPresent(params, "concept", filters.concept);
    setIfPresent(params, "promptVersion", filters.promptVersion);

    const query = params.toString();
    return query ? `?${query}` : "";
  }, [filters]);
}

function setIfPresent(params: URLSearchParams, key: string, value: string) {
  if (value.trim()) {
    params.set(key, value.trim());
  }
}

function getStartDate(range: IntelligenceDashboardFilters["dateRange"]) {
  if (range === "all") {
    return null;
  }

  const date = new Date();

  if (range === "today") {
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  }

  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  date.setDate(date.getDate() - (days - 1));
  date.setHours(0, 0, 0, 0);

  return date.toISOString();
}
