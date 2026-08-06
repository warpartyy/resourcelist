import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/database.types";
import {
  applyIntelligenceReportFilters,
  applyRawEventPagination,
  paginateReportItems,
  serializeIntelligenceFilters,
  sortReportItems,
  type IntelligenceReportFilters,
} from "./filters";
import type { JourneyIntelligence } from "../types";

export type { IntelligenceReportFilters } from "./filters";
export { paginateReportItems } from "./filters";

export type IntelligenceEventRow =
  Database["public"]["Tables"]["resource_guide_intelligence_events"]["Row"];

export type CountMetric = {
  name: string;
  count: number;
};

export type NamedCountMetric = {
  count: number;
};

export type DateRangePreset = "today" | "7d" | "30d" | "90d";

export type OverviewReport = {
  conversationCount: number;
  answerCount: number;
  clarificationCount: number;
  averageResponseTimeMs: number;
  averageRecommendationCount: number;
  helpfulRate: number;
  feedbackRate: number;
};

export type NeedReportItem = {
  need: string;
  count: number;
};

export type ConceptReportItem = {
  concept: string;
  count: number;
};

export type GeographyReport = {
  cities: CountMetric[];
  counties: CountMetric[];
  states: CountMetric[];
};

export type ResourcePerformanceItem = {
  resourceId: string;
  organization: string;
  recommendations: number;
  clicks: number;
  clickThroughRate: number;
};

export type ResourcePerformanceReport = {
  mostRecommendedResources: ResourcePerformanceItem[];
  mostClickedResources: ResourcePerformanceItem[];
  lowestClickThroughRate: ResourcePerformanceItem[];
};

export type FeedbackSelectionCount = {
  selection: string;
  count: number;
};

export type FeedbackOtherCount = {
  response: string;
  count: number;
};

export type FeedbackReport = {
  helpfulRate: number;
  notHelpfulRate: number;
  positiveSelections: FeedbackSelectionCount[];
  negativeSelections: FeedbackSelectionCount[];
  otherResponses: FeedbackOtherCount[];
};

export type QualityReport = {
  clarificationRate: number;
  selectionTierUsage: CountMetric[];
  recommendationModes: CountMetric[];
  validationPassRate: number;
  validationIssues: CountMetric[];
  averageCandidateCount: number;
  averageHighConfidenceCount: number;
  averageResourceCount: number;
};

export type TrendDay = {
  date: string;
  conversationCount: number;
  helpfulRate: number;
  clarificationRate: number;
  averageResponseTimeMs: number;
  averageRecommendationCount: number;
};

export type TrendsReport = {
  range: DateRangePreset;
  days: TrendDay[];
};

export type OpportunityReportItem = {
  need: string;
  concept: string;
  city: string;
  searches: number;
  averageRecommendations: number;
  helpfulRate: number;
  clarificationRate: number;
};

export type IntelligenceReportResponse<T> = {
  generatedAt: string;
  filters: Record<string, string | number>;
  data: T;
};

export async function fetchIntelligenceEvents(
  columns: string,
  filters?: IntelligenceReportFilters,
  options: { paginateRawEvents?: boolean } = {}
): Promise<IntelligenceEventRow[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("resource_guide_intelligence_events")
    .select(columns);

  if (filters) {
    query = applyIntelligenceReportFilters(query, filters);
  }

  query =
    filters && options.paginateRawEvents
      ? applyRawEventPagination(query, filters)
      : query.order("created_at", { ascending: true });

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as IntelligenceEventRow[];
}

export function buildReportResponse<T>(
  filters: IntelligenceReportFilters,
  data: T
): IntelligenceReportResponse<T> {
  return {
    generatedAt: new Date().toISOString(),
    filters: serializeIntelligenceFilters(filters),
    data,
  };
}

export function sortAndPaginate<T extends object>(
  items: T[],
  filters: IntelligenceReportFilters,
  defaultSort: keyof T
): T[] {
  return paginateReportItems(sortReportItems(items, filters, defaultSort), filters);
}

export function countArrayValues(values: Array<string[] | null | undefined>) {
  const counts = new Map<string, number>();

  for (const array of values) {
    for (const value of array ?? []) {
      const trimmed = value.trim();

      if (trimmed) {
        counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
      }
    }
  }

  return sortCountEntries(counts);
}

export function countValues(values: Array<string | null | undefined>) {
  const counts = new Map<string, number>();

  for (const value of values) {
    const trimmed = value?.trim();

    if (trimmed) {
      counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
    }
  }

  return sortCountEntries(counts);
}

export function average(values: Array<number | null | undefined>): number {
  const validValues = values.filter(
    (value): value is number => typeof value === "number"
  );

  if (validValues.length === 0) {
    return 0;
  }

  return roundMetric(
    validValues.reduce((sum, value) => sum + value, 0) / validValues.length
  );
}

export function ratio(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 0;
  }

  return roundMetric(numerator / denominator);
}

export function uniqueCount(values: string[]): number {
  return new Set(values.filter(Boolean)).size;
}

export function roundMetric(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function toCountMetrics(entries: Array<[string, number]>): CountMetric[] {
  return entries.map(([name, count]) => ({ name, count }));
}

export function getRangeStart(range: DateRangePreset): string {
  const now = new Date();
  const start = new Date(now);

  if (range === "today") {
    start.setHours(0, 0, 0, 0);
    return start.toISOString();
  }

  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  start.setDate(now.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  return start.toISOString();
}

export function readStructuredFeedback(value: Json): {
  sentiment?: string;
  selections: string[];
  otherText?: string;
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { selections: [] };
  }

  const sentiment =
    typeof value.sentiment === "string" ? value.sentiment : undefined;
  const selections = Array.isArray(value.selections)
    ? value.selections.filter((item): item is string => typeof item === "string")
    : [];
  const otherText =
    typeof value.otherText === "string" && value.otherText.trim()
      ? value.otherText.trim()
      : undefined;

  return { sentiment, selections, otherText };
}

export function readJourneyIntelligence(value: Json): JourneyIntelligence | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const journey = value.journey;

  if (!journey || typeof journey !== "object" || Array.isArray(journey)) {
    return null;
  }

  return journey as JourneyIntelligence;
}

function sortCountEntries(counts: Map<string, number>): Array<[string, number]> {
  return Array.from(counts.entries()).sort((left, right) => {
    if (right[1] !== left[1]) {
      return right[1] - left[1];
    }

    return left[0].localeCompare(right[0]);
  });
}
