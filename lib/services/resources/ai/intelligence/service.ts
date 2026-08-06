import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Json } from "@/lib/database.types";
import {
  buildAnswerIntelligenceEvent,
  buildClarificationIntelligenceEvent,
  buildFeedbackIntelligenceEvent,
  buildResourceClickIntelligenceEvent,
} from "./collector";
import type {
  CollectAnswerIntelligenceInput,
  CollectClarificationIntelligenceInput,
  CollectFeedbackIntelligenceInput,
  CollectResourceClickIntelligenceInput,
  ResourceGuideIntelligenceEventV1,
  ResourceGuideIntelligenceStorageInsert,
} from "./types";

export async function collectAnswerIntelligence(
  input: CollectAnswerIntelligenceInput
): Promise<{ id: string } | null> {
  return insertIntelligenceEvent(buildAnswerIntelligenceEvent(input));
}

export async function collectClarificationIntelligence(
  input: CollectClarificationIntelligenceInput
): Promise<{ id: string } | null> {
  return insertIntelligenceEvent(buildClarificationIntelligenceEvent(input));
}

export async function collectFeedbackIntelligence(
  input: CollectFeedbackIntelligenceInput
): Promise<{ id: string } | null> {
  return insertIntelligenceEvent(buildFeedbackIntelligenceEvent(input));
}

export async function collectResourceClickIntelligence(
  input: CollectResourceClickIntelligenceInput
): Promise<{ id: string } | null> {
  return insertIntelligenceEvent(buildResourceClickIntelligenceEvent(input));
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
    },
  };
}
