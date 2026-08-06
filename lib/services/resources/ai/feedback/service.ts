import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Json } from "@/lib/database.types";
import {
  collectFeedbackIntelligence,
  collectResourceClickIntelligence,
} from "@/lib/services/resources/ai/intelligence/service";
import type {
  AiFeedbackReport,
  AiFeedbackStorageInsert,
  AiFeedbackStorageRow,
  SubmitAiFeedbackInput,
  TrackAiResourceClickInput,
} from "./types";

const MAX_TEXT_LENGTH = 10_000;
const MAX_ID_LENGTH = 180;
const MAX_RESOURCE_IDS = 25;
const MAX_STRUCTURED_SELECTIONS = 12;

export async function submitAiFeedback(
  input: SubmitAiFeedbackInput
): Promise<{ id: string }> {
  validateFeedbackInput(input);

  const supabase = getSupabaseAdmin();
  const insert = buildFeedbackInsert(input);
  const { data, error } = await supabase
    .from("resource_guide_feedback")
    .insert(insert)
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  if (input.helpful !== null) {
    await collectFeedbackIntelligence({
      conversationId: input.conversationId,
      toolId: input.toolId,
      promptVersion: input.promptVersion,
      model: input.model,
      detectedNeeds: input.metadata?.detectedNeeds,
      expandedTerms: input.metadata?.expandedTerms,
      normalizedQuery: input.metadata?.normalizedQuery,
      resourceIds: input.resourceIds,
      feedbackType: input.helpful ? "helpful" : "not_helpful",
      structuredFeedback: input.structuredFeedback ?? null,
      confidence: input.confidence,
      feedbackId: data.id,
    });
  }

  return { id: data.id };
}

export async function trackAiResourceClick(
  input: TrackAiResourceClickInput
): Promise<{ id: string }> {
  validateClickInput(input);

  const supabase = getSupabaseAdmin();
  const insert = buildClickInsert(input);
  const { data, error } = await supabase
    .from("resource_guide_feedback")
    .insert(insert)
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  await collectResourceClickIntelligence({
    conversationId: input.conversationId,
    toolId: input.toolId,
    promptVersion: input.promptVersion,
    model: input.model,
    detectedNeeds: input.metadata?.detectedNeeds,
    expandedTerms: input.metadata?.expandedTerms,
    normalizedQuery: input.metadata?.normalizedQuery,
    resourceIds: input.resourceIds,
    clickedResourceId: input.clickedResourceId,
    confidence: input.confidence,
    feedbackId: data.id,
    recommendationPosition: input.recommendationPosition,
    totalRecommendationsShown: input.totalRecommendationsShown,
    timeUntilClickMs: input.timeUntilClickMs,
  });

  return { id: data.id };
}

export async function getAiFeedbackReport(): Promise<AiFeedbackReport> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("resource_guide_feedback")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    throw error;
  }

  return summarizeAiFeedback(data ?? []);
}

export function buildFeedbackInsert(
  input: SubmitAiFeedbackInput
): AiFeedbackStorageInsert {
  const aiMetadata = mergeJsonRecords(input.metadata?.aiMetadata, {
    toolId: input.toolId ?? null,
    confidence: input.confidence ?? null,
    structuredFeedback: input.structuredFeedback
      ? normalizeStructuredFeedback(input.structuredFeedback)
      : null,
  });

  return {
    conversation_id: input.conversationId.trim(),
    interaction_type: "response_feedback",
    user_message: normalizeOptionalText(input.query),
    ai_response: normalizeOptionalText(input.response),
    feedback_type:
      input.helpful === null ? null : input.helpful ? "helpful" : "not_helpful",
    feedback_reason: normalizeOptionalText(input.reason),
    search_metadata: input.metadata?.searchMetadata ?? {},
    ai_metadata: aiMetadata,
    selected_resource_ids: normalizeResourceIds(input.resourceIds),
    prompt_version: normalizeOptionalText(input.promptVersion),
    model: normalizeOptionalText(input.model),
    normalized_query: normalizeOptionalText(input.metadata?.normalizedQuery),
    detected_needs: normalizeStringArray(input.metadata?.detectedNeeds),
    expanded_terms: normalizeStringArray(input.metadata?.expandedTerms),
    thumbs_up: input.helpful === true,
    thumbs_down: input.helpful === false,
    conversation_notes: normalizeOptionalText(input.feedbackText),
  };
}

export function buildClickInsert(
  input: TrackAiResourceClickInput
): AiFeedbackStorageInsert {
  const aiMetadata = mergeJsonRecords(input.metadata?.aiMetadata, {
    toolId: input.toolId ?? null,
    confidence: input.confidence ?? null,
    resourceSelection: {
      recommendationPosition: input.recommendationPosition ?? null,
      totalRecommendationsShown: input.totalRecommendationsShown ?? null,
      timeUntilClickMs: input.timeUntilClickMs ?? null,
    },
  });

  return {
    conversation_id: input.conversationId.trim(),
    interaction_type: "resource_click",
    user_message: normalizeOptionalText(input.query),
    ai_response: normalizeOptionalText(input.response),
    feedback_type: null,
    feedback_reason: null,
    search_metadata: input.metadata?.searchMetadata ?? {},
    ai_metadata: aiMetadata,
    selected_resource_ids: normalizeResourceIds(input.resourceIds),
    clicked_resource_id: input.clickedResourceId.trim(),
    prompt_version: normalizeOptionalText(input.promptVersion),
    model: normalizeOptionalText(input.model),
    normalized_query: normalizeOptionalText(input.metadata?.normalizedQuery),
    detected_needs: normalizeStringArray(input.metadata?.detectedNeeds),
    expanded_terms: normalizeStringArray(input.metadata?.expandedTerms),
    thumbs_up: null,
    thumbs_down: null,
  };
}

export function summarizeAiFeedback(
  rows: AiFeedbackStorageRow[]
): AiFeedbackReport {
  const feedbackRows = rows.filter(
    (row) => row.interaction_type === "response_feedback"
  );
  const helpfulRows = feedbackRows.filter((row) => row.thumbs_up === true);
  const negativeComments = feedbackRows
    .filter((row) => row.thumbs_down === true)
    .map((row) => row.conversation_notes)
    .filter((value): value is string => Boolean(value?.trim()));

  return {
    totalFeedback: feedbackRows.length,
    helpfulRate:
      feedbackRows.length > 0 ? helpfulRows.length / feedbackRows.length : 0,
    feedbackByPromptVersion: countValues(
      feedbackRows.map((row) => row.prompt_version || "unknown")
    ).map(([promptVersion, count]) => ({ promptVersion, count })),
    feedbackByTool: countValues(
      feedbackRows.map((row) => readToolId(row.ai_metadata))
    ).map(([toolId, count]) => ({ toolId, count })),
    mostCommonNegativeComments: countValues(negativeComments).map(
      ([comment, count]) => ({ comment, count })
    ),
  };
}

function validateFeedbackInput(input: SubmitAiFeedbackInput) {
  validateRequiredString(input.conversationId, "conversationId");

  if (input.helpful !== true && input.helpful !== false && input.helpful !== null) {
    throw new Error("Invalid helpful value");
  }

  validateOptionalString(input.feedbackText, "feedbackText", MAX_TEXT_LENGTH);
  validateOptionalString(input.query, "query", MAX_TEXT_LENGTH);
  validateOptionalString(input.response, "response", MAX_TEXT_LENGTH);
  validateOptionalString(input.toolId, "toolId", MAX_ID_LENGTH);
  validateOptionalString(input.promptVersion, "promptVersion", MAX_ID_LENGTH);
  validateOptionalString(input.model, "model", MAX_ID_LENGTH);
  validateOptionalString(input.reason, "reason", MAX_ID_LENGTH);
  validateResourceIds(input.resourceIds);
  validateStructuredFeedback(input.structuredFeedback);
}

function validateClickInput(input: TrackAiResourceClickInput) {
  validateRequiredString(input.conversationId, "conversationId");
  validateRequiredString(input.clickedResourceId, "clickedResourceId");
  validateOptionalString(input.query, "query", MAX_TEXT_LENGTH);
  validateOptionalString(input.response, "response", MAX_TEXT_LENGTH);
  validateOptionalString(input.toolId, "toolId", MAX_ID_LENGTH);
  validateOptionalString(input.promptVersion, "promptVersion", MAX_ID_LENGTH);
  validateOptionalString(input.model, "model", MAX_ID_LENGTH);
  validateResourceIds(input.resourceIds);
  validateOptionalPositiveInteger(
    input.recommendationPosition,
    "recommendationPosition"
  );
  validateOptionalPositiveInteger(
    input.totalRecommendationsShown,
    "totalRecommendationsShown"
  );
  validateOptionalPositiveInteger(input.timeUntilClickMs, "timeUntilClickMs");
}

function validateRequiredString(value: string, fieldName: string) {
  if (typeof value !== "string" || !value.trim() || value.length > MAX_ID_LENGTH) {
    throw new Error(`${fieldName} is required`);
  }
}

function validateOptionalString(
  value: string | null | undefined,
  fieldName: string,
  maxLength: number
) {
  if (value !== undefined && value !== null && value.length > maxLength) {
    throw new Error(`Invalid ${fieldName}`);
  }
}

function validateResourceIds(resourceIds: string[] | undefined) {
  if (resourceIds === undefined) {
    return;
  }

  if (
    !Array.isArray(resourceIds) ||
    resourceIds.length > MAX_RESOURCE_IDS ||
    resourceIds.some((id) => typeof id !== "string" || !id.trim() || id.length > MAX_ID_LENGTH)
  ) {
    throw new Error("Invalid resourceIds");
  }
}

function validateOptionalPositiveInteger(
  value: number | null | undefined,
  fieldName: string
) {
  if (value === undefined || value === null) {
    return;
  }

  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Invalid ${fieldName}`);
  }
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeStringArray(value: string[] | undefined): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => item.trim())
    .filter((item, index, items) => item && items.indexOf(item) === index);
}

function normalizeResourceIds(resourceIds: string[] | undefined): string[] {
  return normalizeStringArray(resourceIds).slice(0, MAX_RESOURCE_IDS);
}

function validateStructuredFeedback(
  structuredFeedback: SubmitAiFeedbackInput["structuredFeedback"]
) {
  if (structuredFeedback === undefined) {
    return;
  }

  if (
    structuredFeedback.sentiment !== "helpful" &&
    structuredFeedback.sentiment !== "not_helpful"
  ) {
    throw new Error("Invalid structuredFeedback");
  }

  if (
    !Array.isArray(structuredFeedback.selections) ||
    structuredFeedback.selections.length > MAX_STRUCTURED_SELECTIONS ||
    structuredFeedback.selections.some(
      (selection) =>
        typeof selection !== "string" ||
        !selection.trim() ||
        selection.length > MAX_ID_LENGTH
    )
  ) {
    throw new Error("Invalid structuredFeedback");
  }

  validateOptionalString(
    structuredFeedback.otherText,
    "structuredFeedback.otherText",
    MAX_TEXT_LENGTH
  );
}

function normalizeStructuredFeedback(
  structuredFeedback: NonNullable<SubmitAiFeedbackInput["structuredFeedback"]>
): Json {
  return {
    sentiment: structuredFeedback.sentiment,
    selections: normalizeStringArray(structuredFeedback.selections).slice(
      0,
      MAX_STRUCTURED_SELECTIONS
    ),
    otherText: normalizeOptionalText(structuredFeedback.otherText),
  };
}

function mergeJsonRecords(
  base: Json | undefined,
  additions: Record<string, Json>
): Json {
  const record =
    base && typeof base === "object" && !Array.isArray(base)
      ? { ...base }
      : {};

  for (const [key, value] of Object.entries(additions)) {
    if (value !== null && value !== undefined) {
      record[key] = value;
    }
  }

  return record;
}

function readToolId(metadata: Json): string {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return "unknown";
  }

  const value = metadata.toolId;
  return typeof value === "string" && value.trim() ? value : "unknown";
}

function countValues(values: string[]): Array<[string, number]> {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return Array.from(counts.entries()).sort((left, right) => right[1] - left[1]);
}
