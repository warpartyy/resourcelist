import {
  countValues,
  fetchIntelligenceEvents,
  sortAndPaginate,
  toCountMetrics,
  type CountMetric,
  type GeographyReport,
  type IntelligenceReportFilters,
} from "./types";

export async function getResourceGuideGeographyReport(
  filters: IntelligenceReportFilters
): Promise<GeographyReport> {
  const events = await fetchIntelligenceEvents("city,county,state", filters);

  return {
    cities: sortGeoMetrics(
      toCountMetrics(countValues(events.map((event) => event.city))),
      filters
    ),
    counties: sortGeoMetrics(
      toCountMetrics(countValues(events.map((event) => event.county))),
      filters
    ),
    states: sortGeoMetrics(
      toCountMetrics(countValues(events.map((event) => event.state))),
      filters
    ),
  };
}

function sortGeoMetrics(
  items: CountMetric[],
  filters: IntelligenceReportFilters
): CountMetric[] {
  return sortAndPaginate(items, filters, "count");
}
