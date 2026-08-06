import {
  average,
  fetchIntelligenceEvents,
  ratio,
  sortAndPaginate,
  type IntelligenceEventRow,
  type IntelligenceReportFilters,
  type OpportunityReportItem,
} from "./types";

type OpportunityAccumulator = {
  need: string;
  concept: string;
  city: string;
  conversationIds: Set<string>;
  recommendationCounts: number[];
  clarificationCount: number;
};

export async function getResourceGuideOpportunitiesReport(
  filters: IntelligenceReportFilters
): Promise<OpportunityReportItem[]> {
  const events = await fetchIntelligenceEvents(
    "conversation_id,event_type,detected_needs,search_concepts,city,recommended_resource_ids,clarification_triggered,feedback_type",
    filters
  );
  const feedbackByConversation = buildFeedbackByConversation(events);
  const groups = new Map<string, OpportunityAccumulator>();

  for (const event of events.filter(isSearchEvent)) {
    for (const need of event.detected_needs.length ? event.detected_needs : ["unknown"]) {
      for (const concept of event.search_concepts.length ? event.search_concepts : ["unknown"]) {
        const city = event.city || "unknown";
        const key = `${need}|${concept}|${city}`;
        const group =
          groups.get(key) ??
          createOpportunityAccumulator({ need, concept, city });

        group.conversationIds.add(event.conversation_id);
        group.recommendationCounts.push(event.recommended_resource_ids.length);

        if (event.clarification_triggered) {
          group.clarificationCount += 1;
        }

        groups.set(key, group);
      }
    }
  }

  const items = Array.from(groups.values())
    .map((group) => buildOpportunityItem(group, feedbackByConversation))
    .filter((item) => item.searches > 0)
    .sort(compareOpportunities);

  return sortAndPaginate(items, filters, "searches");
}

function buildFeedbackByConversation(events: IntelligenceEventRow[]) {
  const feedbackByConversation = new Map<
    string,
    Array<"helpful" | "not_helpful">
  >();

  for (const event of events) {
    if (
      event.event_type !== "feedback_submitted" ||
      (event.feedback_type !== "helpful" && event.feedback_type !== "not_helpful")
    ) {
      continue;
    }

    feedbackByConversation.set(event.conversation_id, [
      ...(feedbackByConversation.get(event.conversation_id) ?? []),
      event.feedback_type,
    ]);
  }

  return feedbackByConversation;
}

function buildOpportunityItem(
  group: OpportunityAccumulator,
  feedbackByConversation: Map<string, Array<"helpful" | "not_helpful">>
): OpportunityReportItem {
  const feedback = Array.from(group.conversationIds).flatMap(
    (conversationId) => feedbackByConversation.get(conversationId) ?? []
  );

  return {
    need: group.need,
    concept: group.concept,
    city: group.city,
    searches: group.conversationIds.size,
    averageRecommendations: average(group.recommendationCounts),
    helpfulRate: ratio(
      feedback.filter((feedbackType) => feedbackType === "helpful").length,
      feedback.length
    ),
    clarificationRate: ratio(group.clarificationCount, group.conversationIds.size),
  };
}

function createOpportunityAccumulator({
  need,
  concept,
  city,
}: {
  need: string;
  concept: string;
  city: string;
}): OpportunityAccumulator {
  return {
    need,
    concept,
    city,
    conversationIds: new Set(),
    recommendationCounts: [],
    clarificationCount: 0,
  };
}

function isSearchEvent(event: IntelligenceEventRow): boolean {
  return (
    event.event_type === "answer_returned" ||
    event.event_type === "clarification_returned"
  );
}

function compareOpportunities(
  left: OpportunityReportItem,
  right: OpportunityReportItem
): number {
  if (right.searches !== left.searches) {
    return right.searches - left.searches;
  }

  if (left.averageRecommendations !== right.averageRecommendations) {
    return left.averageRecommendations - right.averageRecommendations;
  }

  if (left.helpfulRate !== right.helpfulRate) {
    return left.helpfulRate - right.helpfulRate;
  }

  return right.clarificationRate - left.clarificationRate;
}
