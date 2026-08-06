import {
  average,
  countValues,
  fetchIntelligenceEvents,
  ratio,
  sortAndPaginate,
  toCountMetrics,
  type CountMetric,
  type IntelligenceReportFilters,
  type QualityReport,
} from "./types";

export async function getResourceGuideQualityReport(
  filters: IntelligenceReportFilters
): Promise<QualityReport> {
  const events = await fetchIntelligenceEvents(
    "event_type,clarification_triggered,selection_tier,recommendation_mode,validation_passed,validation_issue_count,candidate_count,high_confidence_count,resource_count",
    filters
  );
  const answerEvents = events.filter((event) => event.event_type === "answer_returned");
  const validationEvents = answerEvents.filter(
    (event) => event.validation_passed !== null
  );

  return {
    clarificationRate: ratio(
      events.filter((event) => event.clarification_triggered).length,
      events.length
    ),
    selectionTierUsage: sortQualityMetrics(
      toCountMetrics(countValues(answerEvents.map((event) => event.selection_tier))),
      filters
    ),
    recommendationModes: sortQualityMetrics(
      toCountMetrics(countValues(events.map((event) => event.recommendation_mode))),
      filters
    ),
    validationPassRate: ratio(
      validationEvents.filter((event) => event.validation_passed === true).length,
      validationEvents.length
    ),
    validationIssues: sortQualityMetrics(
      toCountMetrics(countValues(
        answerEvents
          .filter((event) => event.validation_issue_count > 0)
          .map((event) => `${event.validation_issue_count} issue(s)`)
      )),
      filters
    ),
    averageCandidateCount: average(events.map((event) => event.candidate_count)),
    averageHighConfidenceCount: average(
      events.map((event) => event.high_confidence_count)
    ),
    averageResourceCount: average(events.map((event) => event.resource_count)),
  };
}

function sortQualityMetrics(
  items: CountMetric[],
  filters: IntelligenceReportFilters
): CountMetric[] {
  return sortAndPaginate(items, filters, "count");
}
