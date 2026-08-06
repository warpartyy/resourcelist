import { fetchApprovedResourceDirectorySummaries } from "@/lib/services/resources/approvedResourcesProvider";
import {
  fetchIntelligenceEvents,
  paginateReportItems,
  ratio,
  roundMetric,
  sortAndPaginate,
  type IntelligenceReportFilters,
  type ResourcePerformanceItem,
  type ResourcePerformanceReport,
} from "./types";

const RESOURCE_REPORT_LIMIT = 25;

export async function getResourceGuideResourcePerformanceReport(
  filters: IntelligenceReportFilters
): Promise<ResourcePerformanceReport> {
  const [events, approvedResources] = await Promise.all([
    fetchIntelligenceEvents("recommended_resource_ids,clicked_resource_ids", filters),
    fetchApprovedResourceDirectorySummaries(),
  ]);
  const organizations = new Map(
    approvedResources.map((resource) => [
      resource.id,
      resource.organization || "Unnamed resource",
    ])
  );
  const resourceStats = new Map<
    string,
    { recommendations: number; clicks: number }
  >();

  for (const event of events) {
    for (const resourceId of event.recommended_resource_ids) {
      const stats = getStats(resourceStats, resourceId);
      stats.recommendations += 1;
    }

    for (const resourceId of event.clicked_resource_ids) {
      const stats = getStats(resourceStats, resourceId);
      stats.clicks += 1;
    }
  }

  const items = Array.from(resourceStats.entries()).map(([resourceId, stats]) =>
    buildResourcePerformanceItem(resourceId, stats, organizations)
  );

  return {
    mostRecommendedResources: sortAndPaginate([...items]
      .sort((left, right) => right.recommendations - left.recommendations)
      .slice(0, RESOURCE_REPORT_LIMIT), filters, "recommendations"),
    mostClickedResources: sortAndPaginate([...items]
      .sort((left, right) => right.clicks - left.clicks)
      .slice(0, RESOURCE_REPORT_LIMIT), filters, "clicks"),
    lowestClickThroughRate: paginateLowestClickThroughRate(items, filters),
  };
}

function paginateLowestClickThroughRate(
  items: ResourcePerformanceItem[],
  filters: IntelligenceReportFilters
): ResourcePerformanceItem[] {
  const sortedItems = items
    .filter((item) => item.recommendations > 0)
    .sort((left, right) => {
      if (left.clickThroughRate !== right.clickThroughRate) {
        return left.clickThroughRate - right.clickThroughRate;
      }

      return right.recommendations - left.recommendations;
    })
    .slice(0, RESOURCE_REPORT_LIMIT);

  if (filters.sort) {
    return sortAndPaginate(sortedItems, filters, "clickThroughRate");
  }

  return paginateReportItems(sortedItems, filters);
}

function getStats(
  stats: Map<string, { recommendations: number; clicks: number }>,
  resourceId: string
) {
  const existing = stats.get(resourceId);

  if (existing) {
    return existing;
  }

  const next = { recommendations: 0, clicks: 0 };
  stats.set(resourceId, next);

  return next;
}

function buildResourcePerformanceItem(
  resourceId: string,
  stats: { recommendations: number; clicks: number },
  organizations: Map<string, string>
): ResourcePerformanceItem {
  return {
    resourceId,
    organization: organizations.get(resourceId) ?? "Unknown resource",
    recommendations: stats.recommendations,
    clicks: stats.clicks,
    clickThroughRate: roundMetric(ratio(stats.clicks, stats.recommendations)),
  };
}
