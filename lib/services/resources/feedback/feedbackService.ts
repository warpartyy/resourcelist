import { createClient } from "@/lib/supabase/server";
import type {
  ResourceGuideFeedbackInsert,
  ResourceGuideFeedbackReason,
  ResourceGuideFeedbackRow,
  ResourceGuideFeedbackSummary,
  ResourceGuideFeedbackType,
  SubmitResourceGuideFeedbackInput,
  TrackResourceGuideClickInput,
} from "./types";

const VALID_FEEDBACK_TYPES: ResourceGuideFeedbackType[] = [
  "helpful",
  "not_helpful",
];

const VALID_FEEDBACK_REASONS: ResourceGuideFeedbackReason[] = [
  "did_not_understand",
  "wrong_resources",
  "missing_resources",
  "ai_response_unclear",
  "other",
];

export async function submitResourceGuideFeedback(
  input: SubmitResourceGuideFeedbackInput
): Promise<{ id: string }> {
  validateFeedbackInput(input);

  const supabase = await createClient();
  const insert = buildFeedbackInsert(input);
  const { error } = await supabase
    .from("resource_guide_feedback")
    .insert(insert);

  if (error) {
    throw error;
  }

  return { id: insert.id || "" };
}

export async function trackResourceGuideClick(
  input: TrackResourceGuideClickInput
): Promise<{ id: string }> {
  validateClickInput(input);

  const supabase = await createClient();
  const insert = buildClickInsert(input);
  const { error } = await supabase
    .from("resource_guide_feedback")
    .insert(insert);

  if (error) {
    throw error;
  }

  return { id: insert.id || "" };
}

export function buildFeedbackInsert(
  input: SubmitResourceGuideFeedbackInput
): ResourceGuideFeedbackInsert {
  const metadata = input.metadata;

  return {
    id: createFeedbackId(),
    conversation_id: input.conversationId,
    interaction_type: "response_feedback",
    user_message: metadata.userMessage ?? null,
    ai_response: metadata.aiResponse ?? null,
    feedback_type: input.feedback,
    feedback_reason: input.reason ?? null,
    search_metadata: metadata.searchMetadata ?? {},
    ai_metadata: metadata.aiMetadata ?? {},
    selected_resource_ids: metadata.selectedResourceIds ?? [],
    clicked_resource_id: input.clickedResourceId ?? null,
    prompt_version: metadata.promptVersion ?? null,
    model: metadata.model ?? null,
    normalized_query: metadata.normalizedQuery ?? null,
    detected_needs: metadata.detectedNeeds ?? [],
    expanded_terms: metadata.expandedTerms ?? [],
    thumbs_up: input.feedback === "helpful",
    thumbs_down: input.feedback === "not_helpful",
  };
}

export function buildClickInsert(
  input: TrackResourceGuideClickInput
): ResourceGuideFeedbackInsert {
  const metadata = input.metadata;

  return {
    id: createFeedbackId(),
    conversation_id: input.conversationId,
    interaction_type: "resource_click",
    user_message: metadata.userMessage ?? null,
    ai_response: metadata.aiResponse ?? null,
    feedback_type: null,
    feedback_reason: null,
    search_metadata: metadata.searchMetadata ?? {},
    ai_metadata: metadata.aiMetadata ?? {},
    selected_resource_ids: metadata.selectedResourceIds ?? [],
    clicked_resource_id: input.clickedResourceId,
    prompt_version: metadata.promptVersion ?? null,
    model: metadata.model ?? null,
    normalized_query: metadata.normalizedQuery ?? null,
    detected_needs: metadata.detectedNeeds ?? [],
    expanded_terms: metadata.expandedTerms ?? [],
    thumbs_up: null,
    thumbs_down: null,
  };
}

export function summarizeResourceGuideFeedback(
  rows: ResourceGuideFeedbackRow[]
): ResourceGuideFeedbackSummary {
  const feedbackRows = rows.filter((row) => row.interaction_type === "response_feedback");
  const helpfulRows = feedbackRows.filter((row) => row.feedback_type === "helpful");
  const responseTimeValues = rows
    .map((row) => getNumericMetadataValue(row.ai_metadata, "responseTimeMs"))
    .filter((value): value is number => value !== null);

  return {
    helpfulPercent:
      feedbackRows.length > 0 ? (helpfulRows.length / feedbackRows.length) * 100 : 0,
    totalFeedback: feedbackRows.length,
    mostCommonFailureReasons: countValues(
      feedbackRows
        .filter((row) => row.feedback_type === "not_helpful")
        .map((row) => row.feedback_reason)
    ).map(([reason, count]) => ({ reason, count })),
    mostClickedResources: countValues(
      rows.map((row) => row.clicked_resource_id)
    ).map(([resourceId, count]) => ({ resourceId, count })),
    queriesWithNoHighConfidenceMatches: Array.from(
      new Set(
        rows
          .filter((row) => getNumericMetadataValue(row.ai_metadata, "highConfidenceCount") === 0)
          .map((row) => row.normalized_query)
          .filter((value): value is string => Boolean(value))
      )
    ),
    mostCommonDetectedNeeds: countValues(rows.flatMap((row) => row.detected_needs ?? [])).map(
      ([need, count]) => ({ need, count })
    ),
    averageResponseTimeMs:
      responseTimeValues.length > 0
        ? responseTimeValues.reduce((sum, value) => sum + value, 0) /
          responseTimeValues.length
        : 0,
    promptVersionUsage: countValues(rows.map((row) => row.prompt_version)).map(
      ([promptVersion, count]) => ({ promptVersion, count })
    ),
    modelUsage: countValues(rows.map((row) => row.model)).map(([model, count]) => ({
      model,
      count,
    })),
  };
}

function validateFeedbackInput(input: SubmitResourceGuideFeedbackInput) {
  validateConversationId(input.conversationId);

  if (!VALID_FEEDBACK_TYPES.includes(input.feedback)) {
    throw new Error("Invalid feedback value");
  }

  if (input.reason && !VALID_FEEDBACK_REASONS.includes(input.reason)) {
    throw new Error("Invalid feedback reason");
  }

  if (input.clickedResourceId !== undefined) {
    validateOptionalId(input.clickedResourceId, "clickedResourceId");
  }
}

function validateClickInput(input: TrackResourceGuideClickInput) {
  validateConversationId(input.conversationId);
  validateOptionalId(input.clickedResourceId, "clickedResourceId");
}

function validateConversationId(conversationId: string) {
  if (!conversationId.trim() || conversationId.length > 160) {
    throw new Error("Invalid conversationId");
  }
}

function validateOptionalId(value: string, fieldName: string) {
  if (!value.trim() || value.length > 160) {
    throw new Error(`Invalid ${fieldName}`);
  }
}

function countValues(values: Array<string | null | undefined>): Array<[string, number]> {
  const counts = new Map<string, number>();

  for (const value of values) {
    if (!value) {
      continue;
    }

    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return Array.from(counts.entries()).sort((left, right) => right[1] - left[1]);
}

function getNumericMetadataValue(metadata: unknown, key: string): number | null {
  if (!metadata || typeof metadata !== "object" || !(key in metadata)) {
    return null;
  }

  const value = (metadata as Record<string, unknown>)[key];

  return typeof value === "number" ? value : null;
}

function createFeedbackId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `feedback-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
