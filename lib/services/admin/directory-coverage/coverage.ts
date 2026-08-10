import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  applyIntelligenceReportFilters,
  serializeIntelligenceFilters,
} from "@/lib/services/resources/ai/intelligence/reporting/filters";
import type { IntelligenceEventRow } from "@/lib/services/resources/ai/intelligence/reporting/types";
import {
  calculateGapScore,
  getCoverageLevel,
  getGapLevel,
} from "./gapScore";
import type {
  CoverageExportRow,
  CoverageItem,
  DirectoryCoverageFilters,
  DirectoryCoverageReport,
  DirectoryCoverageResourceRow,
  DirectoryCoverageSummary,
  GeographicCoverageItem,
  ParentCategoryRollup,
  PriorityQueueItem,
} from "./types";

type CountyStats = {
  county: string;
  resourceIds: Set<string>;
  searchCount: number;
  recommendationCount: number;
  feedbackCount: number;
  helpfulCount: number;
};

type SubcategoryStats = {
  subcategory: string;
  parentCategories: Set<string>;
  resourceIds: Set<string>;
  serviceAssignments: number;
  resourcesAdded30Days: number;
  searchCount: number;
  previousSearchCount: number;
  recommendationCount: number;
  feedbackCount: number;
  helpfulCount: number;
  previousFeedbackCount: number;
  previousHelpfulCount: number;
  counties: Map<string, CountyStats>;
};

type DemandEventRow = Pick<
  IntelligenceEventRow,
  | "created_at"
  | "county"
  | "detected_needs"
  | "search_concepts"
  | "recommended_resource_ids"
  | "event_type"
  | "feedback_type"
>;

export async function getDirectoryCoverageReport(
  filters: DirectoryCoverageFilters
): Promise<DirectoryCoverageReport> {
  const [resources, currentEvents, previousEvents] = await Promise.all([
    fetchApprovedCoverageResources(filters),
    fetchDemandEvents(filters),
    fetchPreviousDemandEvents(filters),
  ]);
  const stats = buildInitialStats(resources);
  const aliases = buildSubcategoryAliases(stats);
  const resourceIndex = buildResourceIndex(resources);

  applyDemandMetrics({
    stats,
    intelligenceEvents: currentEvents,
    aliases,
    resourceIndex,
    period: "current",
  });
  applyDemandMetrics({
    stats,
    intelligenceEvents: previousEvents,
    aliases,
    resourceIndex,
    period: "previous",
  });

  const coverage = buildCoverageItems(stats, filters);

  return {
    generatedAt: new Date().toISOString(),
    filters: serializeCoverageFilters(filters),
    summary: buildSummary(resources, coverage),
    health: buildHealthScore(coverage),
    highlights: buildHighlights(coverage),
    parentRollups: buildParentRollups(coverage),
    coverage,
    opportunities: [...coverage]
      .sort((left, right) => right.gapScore - left.gapScore)
      .slice(0, 25),
    priorityQueue: buildPriorityQueue(coverage),
    exportRows: buildExportRows(coverage),
  };
}

export function readDirectoryCoverageFilters(
  req: NextRequest
): DirectoryCoverageFilters {
  const params = req.nextUrl.searchParams;
  const dateRange = readDateRange(params.get("dateRange"));
  const startDate =
    readOptionalDate(params.get("startDate")) ?? getDateRangeStart(dateRange);

  return {
    dateRange,
    startDate,
    endDate: readOptionalDate(params.get("endDate"), true),
    state: readOptionalString(params.get("state")),
    county: readOptionalString(params.get("county")),
    city: readOptionalString(params.get("city")),
    parentCategory: readOptionalString(params.get("parentCategory")),
    sort: readOptionalString(params.get("sort")),
    direction: params.get("direction") === "asc" ? "asc" : "desc",
  };
}

async function fetchApprovedCoverageResources(
  filters: DirectoryCoverageFilters
): Promise<DirectoryCoverageResourceRow[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("resources")
    .select(
      "id,submitted_at,status,state,counties_served,city,parent_categories,subcategories"
    )
    .eq("status", "approved");

  if (filters.state) query = query.eq("state", filters.state);
  if (filters.county) query = query.contains("counties_served", [filters.county]);
  if (filters.city) query = query.eq("city", filters.city);
  if (filters.parentCategory) {
    query = query.contains("parent_categories", [filters.parentCategory]);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []) as DirectoryCoverageResourceRow[];
}

async function fetchDemandEvents(
  filters: DirectoryCoverageFilters
): Promise<DemandEventRow[]> {
  return fetchDemandEventsForRange(filters);
}

async function fetchPreviousDemandEvents(
  filters: DirectoryCoverageFilters
): Promise<DemandEventRow[]> {
  if (!filters.startDate) {
    return [];
  }

  const currentStart = new Date(filters.startDate);
  const currentEnd = filters.endDate ? new Date(filters.endDate) : new Date();
  const durationMs = Math.max(
    24 * 60 * 60 * 1000,
    currentEnd.getTime() - currentStart.getTime()
  );
  const previousEnd = new Date(currentStart.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - durationMs);

  return fetchDemandEventsForRange({
    ...filters,
    startDate: previousStart.toISOString(),
    endDate: previousEnd.toISOString(),
  });
}

async function fetchDemandEventsForRange(filters: DirectoryCoverageFilters) {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("resource_guide_intelligence_events")
    .select(
      "created_at,county,detected_needs,search_concepts,recommended_resource_ids,event_type,feedback_type"
    );

  query = applyIntelligenceReportFilters(query, {
    startDate: filters.startDate,
    endDate: filters.endDate,
    state: filters.state,
    county: filters.county,
    city: filters.city,
    offset: 0,
    direction: "desc",
  });

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []) as DemandEventRow[];
}

function buildInitialStats(resources: DirectoryCoverageResourceRow[]) {
  const stats = new Map<string, SubcategoryStats>();
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  for (const resource of resources) {
    const subcategories = normalizeLabels(resource.subcategories);
    const parentCategories = normalizeLabels(resource.parent_categories);
    const counties = normalizeLabels(resource.counties_served);
    const wasAddedRecently = resource.submitted_at
      ? new Date(resource.submitted_at).getTime() >= thirtyDaysAgo
      : false;

    for (const subcategory of subcategories) {
      const item = getStats(stats, subcategory);
      item.resourceIds.add(resource.id);
      item.serviceAssignments += 1;
      if (wasAddedRecently) item.resourcesAdded30Days += 1;
      parentCategories.forEach((parent) => item.parentCategories.add(parent));
      counties.forEach((county) =>
        getCountyStats(item, county).resourceIds.add(resource.id)
      );
    }
  }

  return stats;
}

function applyDemandMetrics({
  stats,
  intelligenceEvents,
  aliases,
  resourceIndex,
  period,
}: {
  stats: Map<string, SubcategoryStats>;
  intelligenceEvents: DemandEventRow[];
  aliases: Map<string, string>;
  resourceIndex: Map<string, { subcategories: string[]; counties: string[] }>;
  period: "current" | "previous";
}) {
  for (const event of intelligenceEvents) {
    const matched = matchDemandSubcategories(
      [...(event.detected_needs ?? []), ...(event.search_concepts ?? [])],
      aliases
    );
    const eventCounty = event.county?.trim();

    if (
      event.event_type === "answer_returned" ||
      event.event_type === "clarification_returned"
    ) {
      for (const subcategory of matched) {
        const item = getStats(stats, subcategory);
        if (period === "current") item.searchCount += 1;
        else item.previousSearchCount += 1;
        if (eventCounty && period === "current") {
          getCountyStats(item, eventCounty).searchCount += 1;
        }
      }
    }

    if (period === "current") {
      for (const resourceId of event.recommended_resource_ids ?? []) {
        const resource = resourceIndex.get(resourceId);
        if (!resource) continue;
        for (const subcategory of resource.subcategories) {
          const item = getStats(stats, subcategory);
          item.recommendationCount += 1;
          resource.counties.forEach(
            (county) => (getCountyStats(item, county).recommendationCount += 1)
          );
        }
      }
    }

    if (event.event_type === "feedback_submitted") {
      for (const subcategory of matched) {
        const item = getStats(stats, subcategory);
        if (period === "current") {
          item.feedbackCount += 1;
          if (event.feedback_type === "helpful") item.helpfulCount += 1;
          if (eventCounty) {
            const countyStats = getCountyStats(item, eventCounty);
            countyStats.feedbackCount += 1;
            if (event.feedback_type === "helpful") countyStats.helpfulCount += 1;
          }
        } else {
          item.previousFeedbackCount += 1;
          if (event.feedback_type === "helpful") item.previousHelpfulCount += 1;
        }
      }
    }
  }
}

function buildCoverageItems(
  stats: Map<string, SubcategoryStats>,
  filters: DirectoryCoverageFilters
): CoverageItem[] {
  const values = Array.from(stats.values());
  const maxSearchCount = Math.max(...values.map((item) => item.searchCount), 0);
  const maxResourceCount = Math.max(
    ...values.map((item) => item.resourceIds.size),
    0
  );
  const maxRecommendationCount = Math.max(
    ...values.map((item) => item.recommendationCount),
    0
  );
  const items = values.map((item) => {
    const resourceCount = item.resourceIds.size;
    const helpfulRate = ratio(item.helpfulCount, item.feedbackCount);
    const previousHelpfulRate = ratio(
      item.previousHelpfulCount,
      item.previousFeedbackCount
    );
    const recommendationRate = ratio(item.recommendationCount, item.searchCount);
    const gap = calculateGapScore({
      searchCount: item.searchCount,
      resourceCount,
      helpfulRate,
      recommendationCount: item.recommendationCount,
      maxSearchCount,
      maxResourceCount,
      maxRecommendationCount,
    });

    return {
      subcategory: item.subcategory,
      parentCategories: Array.from(item.parentCategories).sort(),
      resourceCount,
      serviceAssignments: item.serviceAssignments,
      searchCount: item.searchCount,
      recommendationCount: item.recommendationCount,
      helpfulRate: roundMetric(helpfulRate),
      recommendationRate: roundMetric(recommendationRate),
      gapScore: gap.score,
      coverageLevel: getCoverageLevel(resourceCount),
      gapLevel: getGapLevel(gap.score),
      gapReasons: gap.reasons,
      trend: {
        resourcesAdded30Days: item.resourcesAdded30Days,
        searchDemandChangePercent: percentChange(
          item.searchCount,
          item.previousSearchCount
        ),
        helpfulRateChangePercent: percentChange(helpfulRate, previousHelpfulRate),
      },
      geographicCoverage: buildGeographicCoverage(item),
    };
  });

  return sortCoverageItems(items, filters);
}

function buildGeographicCoverage(item: SubcategoryStats): GeographicCoverageItem[] {
  const countyValues = Array.from(item.counties.values());
  const maxCountySearches = Math.max(
    ...countyValues.map((county) => county.searchCount),
    0
  );
  const maxCountyResources = Math.max(
    ...countyValues.map((county) => county.resourceIds.size),
    0
  );
  const maxCountyRecommendations = Math.max(
    ...countyValues.map((county) => county.recommendationCount),
    0
  );

  return countyValues
    .map((county) => {
      const helpfulRate = ratio(county.helpfulCount, county.feedbackCount);
      const gap = calculateGapScore({
        searchCount: county.searchCount,
        resourceCount: county.resourceIds.size,
        helpfulRate,
        recommendationCount: county.recommendationCount,
        maxSearchCount: maxCountySearches,
        maxResourceCount: maxCountyResources,
        maxRecommendationCount: maxCountyRecommendations,
      });

      return {
        county: county.county,
        resourceCount: county.resourceIds.size,
        searchCount: county.searchCount,
        helpfulRate: roundMetric(helpfulRate),
        gapScore: gap.score,
        gapLevel: getGapLevel(gap.score),
      };
    })
    .sort((left, right) => right.gapScore - left.gapScore);
}

function buildSummary(
  resources: DirectoryCoverageResourceRow[],
  coverage: CoverageItem[]
): DirectoryCoverageSummary {
  const mostCovered = [...coverage].sort(
    (left, right) => right.resourceCount - left.resourceCount
  )[0];
  const leastCovered = [...coverage]
    .filter((item) => item.resourceCount > 0)
    .sort((left, right) => left.resourceCount - right.resourceCount)[0];
  const highestDemand = [...coverage].sort(
    (left, right) => right.searchCount - left.searchCount
  )[0];
  const highestGap = [...coverage].sort(
    (left, right) => right.gapScore - left.gapScore
  )[0];
  const totalAssignments = coverage.reduce(
    (sum, item) => sum + item.serviceAssignments,
    0
  );

  return {
    approvedResources: resources.length,
    totalServiceAssignments: totalAssignments,
    uniqueSubcategories: coverage.length,
    averageResourcesPerSubcategory:
      coverage.length > 0 ? roundMetric(totalAssignments / coverage.length) : 0,
    mostCoveredCategory: mostCovered?.subcategory ?? null,
    leastCoveredCategory: leastCovered?.subcategory ?? null,
    highestDemandCategory: highestDemand?.subcategory ?? null,
    highestGapScore: highestGap?.gapScore ?? 0,
  };
}

function buildParentRollups(coverage: CoverageItem[]): ParentCategoryRollup[] {
  const rollups = new Map<
    string,
    { resources: number; subcategories: number; helpful: number; gap: number }
  >();

  for (const item of coverage) {
    for (const parent of item.parentCategories) {
      const existing =
        rollups.get(parent) ??
        { resources: 0, subcategories: 0, helpful: 0, gap: 0 };
      existing.resources += item.resourceCount;
      existing.subcategories += 1;
      existing.helpful += item.helpfulRate;
      existing.gap += item.gapScore;
      rollups.set(parent, existing);
    }
  }

  return Array.from(rollups.entries())
    .map(([parentCategory, item]) => ({
      parentCategory,
      resources: item.resources,
      subcategories: item.subcategories,
      averageHelpfulRate: roundMetric(item.helpful / item.subcategories),
      averageGapScore: Math.round(item.gap / item.subcategories),
    }))
    .sort((left, right) => right.averageGapScore - left.averageGapScore);
}

function buildHighlights(coverage: CoverageItem[]) {
  const largestGap = [...coverage].sort((a, b) => b.gapScore - a.gapScore)[0];
  const highestDemand = [...coverage].sort((a, b) => b.searchCount - a.searchCount)[0];
  const mostImproved = [...coverage].sort(
    (a, b) => b.trend.helpfulRateChangePercent - a.trend.helpfulRateChangePercent
  )[0];
  const criticalGeo = coverage
    .flatMap((item) =>
      item.geographicCoverage.map((geo) => ({ item, geo }))
    )
    .sort((a, b) => b.geo.gapScore - a.geo.gapScore)[0];

  return [
    {
      label: "Largest Coverage Gap",
      title: largestGap?.subcategory ?? "None",
      metric: largestGap ? `Gap Score ${largestGap.gapScore}` : "No data",
      detail: largestGap?.gapReasons.join(", ") ?? "No coverage data available",
    },
    {
      label: "Highest Community Demand",
      title: highestDemand?.subcategory ?? "None",
      metric: highestDemand ? `${highestDemand.searchCount} searches` : "No data",
      detail: "Based on Resource Guide demand signals",
    },
    {
      label: "Most Improved",
      title: mostImproved?.subcategory ?? "None",
      metric: mostImproved
        ? `Helpful ${formatSignedPercent(mostImproved.trend.helpfulRateChangePercent)}`
        : "No data",
      detail: "Compared with the previous matching period",
    },
    {
      label: "Critical Geographic Gap",
      title: criticalGeo
        ? `${criticalGeo.geo.county} - ${criticalGeo.item.subcategory}`
        : "None",
      metric: criticalGeo ? `Gap Score ${criticalGeo.geo.gapScore}` : "No data",
      detail: "County-level opportunity with the highest gap score",
    },
  ];
}

function buildPriorityQueue(coverage: CoverageItem[]): PriorityQueueItem[] {
  return coverage
    .flatMap((item) =>
      item.geographicCoverage.map((geo) => ({
        service: item.subcategory,
        county: geo.county,
        gapScore: geo.gapScore,
        reason: buildPriorityReason(geo.resourceCount, geo.searchCount, geo.helpfulRate),
      }))
    )
    .sort((left, right) => right.gapScore - left.gapScore)
    .slice(0, 10)
    .map((item, index) => ({ priority: index + 1, ...item }));
}

function buildExportRows(coverage: CoverageItem[]): CoverageExportRow[] {
  return coverage.flatMap((item) =>
    item.geographicCoverage.map((geo) => ({
      subcategory: item.subcategory,
      county: geo.county,
      resourceCount: geo.resourceCount,
      searchCount: geo.searchCount,
      helpfulRate: geo.helpfulRate,
      recommendationRate: item.recommendationRate,
      gapScore: geo.gapScore,
    }))
  );
}

function buildHealthScore(coverage: CoverageItem[]) {
  const averageGap = average(coverage.map((item) => item.gapScore));
  const averageCoverage = average(coverage.map((item) => item.resourceCount));
  const averageHelpful = average(coverage.map((item) => item.helpfulRate));
  const geographicGaps = coverage.flatMap((item) =>
    item.geographicCoverage.map((geo) => geo.gapScore)
  );
  const averageGeoGap = average(geographicGaps);
  const score = Math.round(
    Math.max(0, Math.min(100, 100 - averageGap * 0.55 - averageGeoGap * 0.25 + averageHelpful * 20))
  );

  return {
    score,
    level:
      score >= 90
        ? "Excellent"
        : score >= 75
          ? "Strong"
          : score >= 60
            ? "Moderate"
            : "Needs Improvement",
    coverage:
      averageCoverage >= 20
        ? "Good"
        : averageCoverage >= 10
          ? "Moderate"
          : "Needs Improvement",
    demandMatch:
      averageGap <= 30 ? "Good" : averageGap <= 60 ? "Moderate" : "Needs Improvement",
    geographicCoverage:
      averageGeoGap <= 30
        ? "Good"
        : averageGeoGap <= 60
          ? "Moderate"
          : "Needs Improvement",
  } as const;
}

function buildResourceIndex(resources: DirectoryCoverageResourceRow[]) {
  const index = new Map<string, { subcategories: string[]; counties: string[] }>();
  resources.forEach((resource) =>
    index.set(resource.id, {
      subcategories: normalizeLabels(resource.subcategories),
      counties: normalizeLabels(resource.counties_served),
    })
  );
  return index;
}

function buildSubcategoryAliases(stats: Map<string, SubcategoryStats>) {
  const aliases = new Map<string, string>();
  for (const subcategory of stats.keys()) {
    aliases.set(normalizeMatchText(subcategory), subcategory);
    normalizeMatchText(subcategory)
      .split(" ")
      .forEach((token) => {
        if (token.length > 3 && !aliases.has(token)) aliases.set(token, subcategory);
      });
  }
  return aliases;
}

function matchDemandSubcategories(values: string[], aliases: Map<string, string>) {
  const matched = new Set<string>();
  for (const value of values) {
    const normalized = normalizeMatchText(value);
    for (const [alias, subcategory] of aliases.entries()) {
      if (normalized === alias || normalized.includes(alias) || alias.includes(normalized)) {
        matched.add(subcategory);
      }
    }
  }
  return matched;
}

function getStats(stats: Map<string, SubcategoryStats>, subcategory: string) {
  const existing = stats.get(subcategory);
  if (existing) return existing;
  const next: SubcategoryStats = {
    subcategory,
    parentCategories: new Set(),
    resourceIds: new Set(),
    serviceAssignments: 0,
    resourcesAdded30Days: 0,
    searchCount: 0,
    previousSearchCount: 0,
    recommendationCount: 0,
    feedbackCount: 0,
    helpfulCount: 0,
    previousFeedbackCount: 0,
    previousHelpfulCount: 0,
    counties: new Map(),
  };
  stats.set(subcategory, next);
  return next;
}

function getCountyStats(item: SubcategoryStats, county: string) {
  const existing = item.counties.get(county);
  if (existing) return existing;
  const next: CountyStats = {
    county,
    resourceIds: new Set(),
    searchCount: 0,
    recommendationCount: 0,
    feedbackCount: 0,
    helpfulCount: 0,
  };
  item.counties.set(county, next);
  return next;
}

function sortCoverageItems(items: CoverageItem[], filters: DirectoryCoverageFilters) {
  const sortKey = filters.sort || "resourceCount";
  const direction = filters.direction === "asc" ? 1 : -1;
  return [...items].sort((left, right) => {
    const leftValue = readSortValue(left, sortKey);
    const rightValue = readSortValue(right, sortKey);
    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return (leftValue - rightValue) * direction;
    }
    return String(leftValue).localeCompare(String(rightValue)) * direction;
  });
}

function readSortValue(item: CoverageItem, sortKey: string) {
  if (sortKey === "alphabetical") return item.subcategory;
  if (sortKey === "gapScore") return item.gapScore;
  if (sortKey === "searchCount") return item.searchCount;
  if (sortKey === "helpfulRate") return item.helpfulRate;
  return item.resourceCount;
}

function serializeCoverageFilters(filters: DirectoryCoverageFilters) {
  return {
    ...serializeIntelligenceFilters({
      startDate: filters.startDate,
      endDate: filters.endDate,
      state: filters.state,
      county: filters.county,
      city: filters.city,
      offset: 0,
      sort: filters.sort,
      direction: filters.direction,
    }),
    ...(filters.parentCategory ? { parentCategory: filters.parentCategory } : {}),
  };
}

function normalizeLabels(values: string[] | null) {
  return Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));
}

function normalizeMatchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[_/,-]+/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildPriorityReason(resources: number, searches: number, helpfulRate: number) {
  if (resources === 0 && searches > 0) return "High demand, no local providers";
  if (resources < 2 && helpfulRate < 0.5) return "Low coverage, poor helpful rate";
  if (searches > resources * 5) return "High search volume relative to coverage";
  return "Demand exceeds current coverage";
}

function readDateRange(value: string | null): DirectoryCoverageFilters["dateRange"] {
  if (value === "all" || value === "today" || value === "7d" || value === "30d" || value === "90d") {
    return value;
  }
  return "30d";
}

function readOptionalString(value: string | null) {
  return value?.trim() || undefined;
}

function readOptionalDate(value: string | null, endOfDay = false) {
  if (!value?.trim()) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  if (endOfDay && !value.includes("T")) date.setHours(23, 59, 59, 999);
  return date.toISOString();
}

function getDateRangeStart(range: DirectoryCoverageFilters["dateRange"]) {
  if (range === "all") return undefined;
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

function ratio(numerator: number, denominator: number) {
  return denominator > 0 ? numerator / denominator : 0;
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function average(values: number[]) {
  return values.length > 0
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
}

function roundMetric(value: number) {
  return Math.round(value * 1000) / 1000;
}

function formatSignedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value}%`;
}
