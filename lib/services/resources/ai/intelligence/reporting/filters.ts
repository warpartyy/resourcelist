import type { NextRequest } from "next/server";

export type SortDirection = "asc" | "desc";

export type IntelligenceReportFilters = {
  startDate?: string;
  endDate?: string;
  state?: string;
  county?: string;
  city?: string;
  need?: string;
  concept?: string;
  promptVersion?: string;
  selectionTier?: string;
  recommendationMode?: string;
  feedbackType?: string;
  limit?: number;
  offset: number;
  sort?: string;
  direction: SortDirection;
};

type FilterableQuery<T> = {
  gte(column: string, value: string): T;
  lte(column: string, value: string): T;
  eq(column: string, value: string): T;
  contains(column: string, value: string[]): T;
  order(column: string, options: { ascending: boolean }): T;
  range(from: number, to: number): T;
};

const DEFAULT_DIRECTION: SortDirection = "desc";
const MAX_LIMIT = 250;

export function readIntelligenceReportFilters(
  req: NextRequest
): IntelligenceReportFilters {
  const params = req.nextUrl.searchParams;

  return {
    startDate: readOptionalDate(params.get("startDate")),
    endDate: readOptionalDate(params.get("endDate"), true),
    state: readOptionalString(params.get("state")),
    county: readOptionalString(params.get("county")),
    city: readOptionalString(params.get("city")),
    need: readOptionalString(params.get("need")),
    concept: readOptionalString(params.get("concept")),
    promptVersion: readOptionalString(params.get("promptVersion")),
    selectionTier: readOptionalString(params.get("selectionTier")),
    recommendationMode: readOptionalString(params.get("recommendationMode")),
    feedbackType: readOptionalString(params.get("feedbackType")),
    limit: readLimit(params.get("limit")),
    offset: readOffset(params.get("offset")),
    sort: readOptionalString(params.get("sort")),
    direction: readDirection(params.get("direction")),
  };
}

export function applyIntelligenceReportFilters<T extends FilterableQuery<T>>(
  query: T,
  filters: IntelligenceReportFilters
): T {
  let next = query;

  if (filters.startDate) {
    next = next.gte("created_at", filters.startDate);
  }

  if (filters.endDate) {
    next = next.lte("created_at", filters.endDate);
  }

  if (filters.state) {
    next = next.eq("state", filters.state);
  }

  if (filters.county) {
    next = next.eq("county", filters.county);
  }

  if (filters.city) {
    next = next.eq("city", filters.city);
  }

  if (filters.need) {
    next = next.contains("detected_needs", [filters.need]);
  }

  if (filters.concept) {
    next = next.contains("search_concepts", [filters.concept]);
  }

  if (filters.promptVersion) {
    next = next.eq("prompt_version", filters.promptVersion);
  }

  if (filters.selectionTier) {
    next = next.eq("selection_tier", filters.selectionTier);
  }

  if (filters.recommendationMode) {
    next = next.eq("recommendation_mode", filters.recommendationMode);
  }

  if (filters.feedbackType) {
    next = next.eq("feedback_type", filters.feedbackType);
  }

  return next;
}

export function applyRawEventPagination<T extends FilterableQuery<T>>(
  query: T,
  filters: IntelligenceReportFilters
): T {
  if (!filters.limit) {
    return query.order("created_at", {
      ascending: filters.direction === "asc",
    });
  }

  const from = filters.offset;
  const to = filters.offset + filters.limit - 1;

  return query
    .order("created_at", { ascending: filters.direction === "asc" })
    .range(from, to);
}

export function paginateReportItems<T>(
  items: T[],
  filters: IntelligenceReportFilters
): T[] {
  if (!filters.limit) {
    return items;
  }

  return items.slice(filters.offset, filters.offset + filters.limit);
}

export function sortReportItems<T extends object>(
  items: T[],
  filters: IntelligenceReportFilters,
  defaultSort: keyof T
): T[] {
  const requestedSort = filters.sort as keyof T | undefined;
  const sortKey =
    requestedSort && items[0] && requestedSort in items[0]
      ? requestedSort
      : defaultSort;
  const direction = filters.direction === "asc" ? 1 : -1;

  return [...items].sort((left, right) => {
    const leftValue = left[sortKey];
    const rightValue = right[sortKey];

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return (leftValue - rightValue) * direction;
    }

    return String(leftValue ?? "").localeCompare(String(rightValue ?? "")) * direction;
  });
}

export function serializeIntelligenceFilters(
  filters: IntelligenceReportFilters
): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined)
  ) as Record<string, string | number>;
}

function readOptionalString(value: string | null): string | undefined {
  return value?.trim() || undefined;
}

function readOptionalDate(
  value: string | null,
  endOfDay = false
): string | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  if (endOfDay && !value.includes("T")) {
    date.setHours(23, 59, 59, 999);
  }

  return date.toISOString();
}

function readLimit(value: string | null): number | undefined {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return undefined;
  }

  return Math.min(parsed, MAX_LIMIT);
}

function readOffset(value: string | null): number {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

function readDirection(value: string | null): SortDirection {
  return value === "asc" || value === "desc" ? value : DEFAULT_DIRECTION;
}
