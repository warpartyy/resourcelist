import {
  countValues,
  fetchIntelligenceEvents,
  ratio,
  readStructuredFeedback,
  sortAndPaginate,
  type FeedbackOtherCount,
  type FeedbackReport,
  type FeedbackSelectionCount,
  type IntelligenceReportFilters,
} from "./types";

export async function getResourceGuideFeedbackReport(
  filters: IntelligenceReportFilters
): Promise<FeedbackReport> {
  const events = await fetchIntelligenceEvents(
    "event_type,feedback_type,structured_feedback",
    filters
  );
  const feedbackEvents = events.filter(
    (event) => event.event_type !== "resource_clicked"
  );
  const helpfulEvents = feedbackEvents.filter(
    (event) => event.feedback_type === "helpful"
  );
  const notHelpfulEvents = feedbackEvents.filter(
    (event) => event.feedback_type === "not_helpful"
  );
  const positiveSelections = feedbackEvents.flatMap((event) => {
    const feedback = readStructuredFeedback(event.structured_feedback);
    return feedback.sentiment === "helpful" ? feedback.selections : [];
  });
  const negativeSelections = feedbackEvents.flatMap((event) => {
    const feedback = readStructuredFeedback(event.structured_feedback);
    return feedback.sentiment === "not_helpful" ? feedback.selections : [];
  });
  const otherResponses = feedbackEvents
    .map((event) => readStructuredFeedback(event.structured_feedback))
    .filter((feedback) => feedback.selections.includes("other"))
    .map((feedback) => feedback.otherText)
    .filter((value): value is string => Boolean(value));

  return {
    helpfulRate: ratio(helpfulEvents.length, feedbackEvents.length),
    notHelpfulRate: ratio(notHelpfulEvents.length, feedbackEvents.length),
    positiveSelections: sortSelectionCounts(
      countValues(positiveSelections).map(([selection, count]) => ({
        selection,
        count,
      })),
      filters
    ),
    negativeSelections: sortSelectionCounts(
      countValues(negativeSelections).map(([selection, count]) => ({
        selection,
        count,
      })),
      filters
    ),
    otherResponses: sortOtherCounts(
      countValues(otherResponses).map(([response, count]) => ({
        response,
        count,
      })),
      filters
    ),
  };
}

function sortSelectionCounts(
  items: FeedbackSelectionCount[],
  filters: IntelligenceReportFilters
): FeedbackSelectionCount[] {
  return sortAndPaginate(items, filters, "count");
}

function sortOtherCounts(
  items: FeedbackOtherCount[],
  filters: IntelligenceReportFilters
): FeedbackOtherCount[] {
  return sortAndPaginate(items, filters, "count");
}
