import {
  countArrayValues,
  fetchIntelligenceEvents,
  sortAndPaginate,
  type IntelligenceReportFilters,
  type ConceptReportItem,
} from "./types";

export async function getResourceGuideConceptsReport(
  filters: IntelligenceReportFilters
): Promise<ConceptReportItem[]> {
  const events = await fetchIntelligenceEvents("search_concepts", filters);
  const items = countArrayValues(events.map((event) => event.search_concepts)).map(
    ([concept, count]) => ({ concept, count })
  );

  return sortAndPaginate(items, filters, "count");
}
