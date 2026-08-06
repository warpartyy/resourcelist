import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Json } from "@/lib/database.types";
import {
  buildAnswerIntelligenceEvent,
  buildClarificationIntelligenceEvent,
  buildConversationCompletionIntelligenceEvent,
  buildFeedbackIntelligenceEvent,
  buildResourceClickIntelligenceEvent,
} from "./collector";
import type {
  CollectAnswerIntelligenceInput,
  CollectClarificationIntelligenceInput,
  CollectFeedbackIntelligenceInput,
  CollectResourceClickIntelligenceInput,
  ConversationCompletionReason,
  ResourceGuideIntelligenceEventV1,
  ResourceGuideIntelligenceStorageInsert,
  SearchOutcome,
} from "./types";

type SearchJourneyState = {
  eventId: string;
  timestamp: string;
  sequenceNumber: number;
};

const searchJourneyByConversation = new Map<string, SearchJourneyState>();

export async function collectAnswerIntelligence(
  input: CollectAnswerIntelligenceInput
): Promise<{ id: string } | null> {
  const previousSearch = searchJourneyByConversation.get(input.conversationId);
  const currentSearchEventId = createEventId();
  const sequenceNumber = previousSearch ? previousSearch.sequenceNumber + 1 : 1;
  const result = await insertIntelligenceEvent(
    buildAnswerIntelligenceEvent({
      ...input,
      currentSearchEventId,
      previousSearchEventId: previousSearch?.eventId,
      previousSearchTimestamp: previousSearch?.timestamp,
      reformulationSequenceNumber: previousSearch ? sequenceNumber : null,
      id: currentSearchEventId,
    })
  );

  if (!result) {
    return null;
  }

  if (previousSearch) {
    searchJourneyByConversation.set(input.conversationId, {
      eventId: result.id,
      timestamp: new Date().toISOString(),
      sequenceNumber,
    });
  } else {
    searchJourneyByConversation.set(input.conversationId, {
      eventId: result.id,
      timestamp: new Date().toISOString(),
      sequenceNumber: 1,
    });
  }

  return result;
}

export async function collectClarificationIntelligence(
  input: CollectClarificationIntelligenceInput
): Promise<{ id: string } | null> {
  return insertIntelligenceEvent(buildClarificationIntelligenceEvent(input));
}

export async function collectFeedbackIntelligence(
  input: CollectFeedbackIntelligenceInput
): Promise<{ id: string } | null> {
  const result = await insertIntelligenceEvent(buildFeedbackIntelligenceEvent(input));

  if (result) {
    await collectConversationCompletionIntelligence({
      conversationId: input.conversationId,
      toolId: input.toolId ?? "resource-search",
      reason: "feedback",
      outcome: input.feedbackType === "helpful" ? "likely_successful" : "unsuccessful",
      sourceFeedbackId: input.feedbackId,
    });
  }

  return result;
}

export async function collectResourceClickIntelligence(
  input: CollectResourceClickIntelligenceInput
): Promise<{ id: string } | null> {
  const result = await insertIntelligenceEvent(
    buildResourceClickIntelligenceEvent(input)
  );

  if (result) {
    await collectConversationCompletionIntelligence({
      conversationId: input.conversationId,
      toolId: input.toolId ?? "resource-search",
      reason: "resource_click",
      outcome: "likely_successful",
      sourceFeedbackId: input.feedbackId,
    });
  }

  return result;
}

export async function collectConversationCompletionIntelligence({
  conversationId,
  toolId,
  reason,
  outcome,
  sourceFeedbackId,
}: {
  conversationId: string;
  toolId: string;
  reason: ConversationCompletionReason;
  outcome: SearchOutcome;
  sourceFeedbackId?: string | null;
}): Promise<{ id: string } | null> {
  return insertIntelligenceEvent(
    buildConversationCompletionIntelligenceEvent({
      conversationId,
      toolId,
      reason,
      outcome,
      sourceFeedbackId,
    })
  );
}

export async function insertIntelligenceEvent(
  event: ResourceGuideIntelligenceEventV1
): Promise<{ id: string } | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("resource_guide_intelligence_events")
      .insert(toStorageInsert(event))
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return { id: data.id };
  } catch (error) {
    console.error("Resource Guide intelligence collection failed", error);
    return null;
  }
}

function toStorageInsert(
  event: ResourceGuideIntelligenceEventV1
): ResourceGuideIntelligenceStorageInsert {
  return {
    id: event.id,
    version: event.version,
    event_type: event.eventType,
    conversation_id: event.conversationId,
    tool_id: event.toolId,
    prompt_version: event.promptVersion,
    model: event.model,
    detected_needs: event.detectedNeeds,
    search_concepts: event.searchConcepts,
    city: event.location?.city ?? null,
    county: event.location?.county ?? null,
    state: event.location?.state ?? null,
    selection_tier: event.selectionTier ?? null,
    candidate_count: event.candidateCount,
    expanded_search: event.expandedSearch,
    recommendation_mode: event.recommendationMode,
    recommended_resource_ids: event.recommendedResourceIds,
    clicked_resource_ids: event.clickedResourceIds,
    resource_count: event.resourceCount,
    high_confidence_count: event.highConfidenceCount,
    clarification_triggered: event.clarificationTriggered,
    clarification_reason: event.clarificationReason,
    feedback_submitted: event.feedbackSubmitted,
    feedback_type: event.feedbackType ?? null,
    structured_feedback: (event.structuredFeedback ?? {}) as Json,
    response_time_ms: event.responseTimeMs,
    validation_passed: event.validationPassed,
    validation_issue_count: event.validationIssueCount,
    metadata: {
      ...(event.sourceFeedbackId
        ? { sourceFeedbackId: event.sourceFeedbackId }
        : {}),
      ...(event.confidence ? { confidence: event.confidence } : {}),
      ...(event.journey ? { journey: event.journey as Json } : {}),
    },
  };
}

function createEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `resource-guide-intelligence-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}
