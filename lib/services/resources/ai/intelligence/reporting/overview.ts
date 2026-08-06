import {
  average,
  fetchIntelligenceEvents,
  ratio,
  uniqueCount,
  type IntelligenceReportFilters,
  type OverviewReport,
} from "./types";

export async function getResourceGuideIntelligenceOverview(
  filters: IntelligenceReportFilters
): Promise<OverviewReport> {
  const events = await fetchIntelligenceEvents(
    "conversation_id,event_type,response_time_ms,recommended_resource_ids,feedback_type",
    filters
  );
  const answerEvents = events.filter((event) => event.event_type === "answer_returned");
  const feedbackEvents = events.filter(
    (event) => event.event_type === "feedback_submitted"
  );
  const helpfulEvents = feedbackEvents.filter(
    (event) => event.feedback_type === "helpful"
  );

  return {
    conversationCount: uniqueCount(events.map((event) => event.conversation_id)),
    answerCount: answerEvents.length,
    clarificationCount: events.filter(
      (event) => event.event_type === "clarification_returned"
    ).length,
    averageResponseTimeMs: average(
      answerEvents.map((event) => event.response_time_ms)
    ),
    averageRecommendationCount: average(
      answerEvents.map((event) => event.recommended_resource_ids.length)
    ),
    helpfulRate: ratio(helpfulEvents.length, feedbackEvents.length),
    feedbackRate: ratio(feedbackEvents.length, answerEvents.length),
  };
}
