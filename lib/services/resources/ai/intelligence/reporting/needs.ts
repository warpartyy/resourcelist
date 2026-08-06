import {
  countArrayValues,
  fetchIntelligenceEvents,
  sortAndPaginate,
  type IntelligenceReportFilters,
  type NeedReportItem,
} from "./types";

export async function getResourceGuideNeedsReport(
  filters: IntelligenceReportFilters
): Promise<NeedReportItem[]> {
  const events = await fetchIntelligenceEvents("detected_needs", filters);
  const items = countArrayValues(events.map((event) => event.detected_needs)).map(
    ([need, count]) => ({ need, count })
  );

  return sortAndPaginate(items, filters, "count");
}
