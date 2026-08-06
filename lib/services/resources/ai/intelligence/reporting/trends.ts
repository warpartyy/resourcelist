import {
  average,
  fetchIntelligenceEvents,
  getRangeStart,
  ratio,
  uniqueCount,
  type DateRangePreset,
  type IntelligenceReportFilters,
  type TrendDay,
  type TrendsReport,
} from "./types";

export async function getResourceGuideTrendsReport(
  range: DateRangePreset,
  filters: IntelligenceReportFilters
): Promise<TrendsReport> {
  const events = await fetchIntelligenceEvents(
    "created_at,conversation_id,event_type,feedback_type,clarification_triggered,response_time_ms,recommended_resource_ids",
    {
      ...filters,
      startDate: filters.startDate ?? getRangeStart(range),
    }
  );
  const grouped = new Map<string, typeof events>();

  for (const event of events) {
    const date = event.created_at.slice(0, 10);
    grouped.set(date, [...(grouped.get(date) ?? []), event]);
  }

  return {
    range,
    days: buildDateKeys(range).map((date) =>
      buildTrendDay(date, grouped.get(date) ?? [])
    ),
  };
}

export function readTrendRange(value: string | null): DateRangePreset {
  if (value === "today" || value === "7d" || value === "30d" || value === "90d") {
    return value;
  }

  return "30d";
}

function buildTrendDay(
  date: string,
  events: Awaited<ReturnType<typeof fetchIntelligenceEvents>>
): TrendDay {
  const answerEvents = events.filter((event) => event.event_type === "answer_returned");
  const feedbackEvents = events.filter(
    (event) => event.event_type === "feedback_submitted"
  );
  const helpfulEvents = feedbackEvents.filter(
    (event) => event.feedback_type === "helpful"
  );

  return {
    date,
    conversationCount: uniqueCount(events.map((event) => event.conversation_id)),
    helpfulRate: ratio(helpfulEvents.length, feedbackEvents.length),
    clarificationRate: ratio(
      events.filter((event) => event.clarification_triggered).length,
      events.length
    ),
    averageResponseTimeMs: average(
      answerEvents.map((event) => event.response_time_ms)
    ),
    averageRecommendationCount: average(
      answerEvents.map((event) => event.recommended_resource_ids.length)
    ),
  };
}

function buildDateKeys(range: DateRangePreset): string[] {
  const start = new Date(getRangeStart(range));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dates: string[] = [];

  for (
    const date = new Date(start);
    date <= today;
    date.setDate(date.getDate() + 1)
  ) {
    dates.push(date.toISOString().slice(0, 10));
  }

  return dates;
}
