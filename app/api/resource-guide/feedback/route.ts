import { NextRequest, NextResponse } from "next/server";
import {
  submitAiFeedback,
  trackAiResourceClick,
} from "@/lib/services/resources/ai/feedback/service";
import type {
  AiFeedbackConfidence,
  AiFeedbackMetadata,
  AiStructuredFeedback,
} from "@/lib/services/resources/ai/feedback/types";
import type { Json } from "@/lib/database.types";

type FeedbackRequestBody = {
  conversationId?: unknown;
  helpful?: unknown;
  feedback?: unknown;
  feedbackText?: unknown;
  reason?: unknown;
  clickedResourceId?: unknown;
  eventType?: unknown;
  toolId?: unknown;
  promptVersion?: unknown;
  model?: unknown;
  query?: unknown;
  response?: unknown;
  resourceIds?: unknown;
  confidence?: unknown;
  metadata?: unknown;
  structuredFeedback?: unknown;
};

const VALID_CONFIDENCE = new Set<AiFeedbackConfidence>([
  "high",
  "medium",
  "low",
  "none",
]);

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as FeedbackRequestBody;
    const conversationId = readRequiredString(body.conversationId, "conversationId");
    const metadata = readMetadata(body.metadata);
    const commonInput = {
      conversationId,
      toolId: readOptionalString(body.toolId),
      promptVersion: readOptionalString(body.promptVersion),
      model: readOptionalString(body.model),
      query: readOptionalString(body.query),
      response: readOptionalString(body.response),
      resourceIds: readOptionalStringArray(body.resourceIds),
      confidence: readConfidence(body.confidence),
      metadata,
    };

    if (body.eventType === "resource_click") {
      const clickedResourceId = readRequiredString(
        body.clickedResourceId,
        "clickedResourceId"
      );
      const result = await trackAiResourceClick({
        ...commonInput,
        clickedResourceId,
      });

      return NextResponse.json({ success: true, id: result.id });
    }

    const result = await submitAiFeedback({
      ...commonInput,
      helpful: readHelpful(body.helpful, body.feedback),
      feedbackText:
        readOptionalString(body.feedbackText) ?? readOptionalString(body.feedback),
      reason: readOptionalString(body.reason),
      structuredFeedback: readStructuredFeedback(body.structuredFeedback),
    });

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid feedback";

    if (message.startsWith("Invalid") || message.endsWith("is required")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("Resource Guide feedback API error", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

function readRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !value.trim() || value.length > 500) {
    throw new Error(`${fieldName} is required`);
  }

  return value.trim();
}

function readHelpful(helpful: unknown, legacyFeedback: unknown): boolean | null {
  if (typeof helpful === "boolean") {
    return helpful;
  }

  if (legacyFeedback === "helpful") {
    return true;
  }

  if (legacyFeedback === "not_helpful") {
    return false;
  }

  throw new Error("Invalid helpful value");
}

function readConfidence(value: unknown): AiFeedbackConfidence | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || !VALID_CONFIDENCE.has(value as AiFeedbackConfidence)) {
    throw new Error("Invalid confidence");
  }

  return value as AiFeedbackConfidence;
}

function readMetadata(value: unknown): AiFeedbackMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const metadata = value as Record<string, unknown>;

  return {
    searchMetadata: isJsonRecord(metadata.searchMetadata)
      ? metadata.searchMetadata
      : undefined,
    aiMetadata: isJsonRecord(metadata.aiMetadata) ? metadata.aiMetadata : undefined,
    normalizedQuery: readOptionalString(metadata.normalizedQuery),
    detectedNeeds: readOptionalStringArray(metadata.detectedNeeds),
    expandedTerms: readOptionalStringArray(metadata.expandedTerms),
  };
}

function readStructuredFeedback(value: unknown): AiStructuredFeedback | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid structuredFeedback");
  }

  const record = value as Record<string, unknown>;
  const sentiment = record.sentiment;

  if (sentiment !== "helpful" && sentiment !== "not_helpful") {
    throw new Error("Invalid structuredFeedback");
  }

  return {
    sentiment,
    selections: readRequiredStringArray(
      record.selections,
      "structuredFeedback.selections"
    ),
    otherText: readOptionalString(record.otherText),
  };
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readOptionalStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
}

function readRequiredStringArray(value: unknown, fieldName: string): string[] {
  const values = readOptionalStringArray(value);

  if (!values || values.length === 0 || values.length > 12) {
    throw new Error(`Invalid ${fieldName}`);
  }

  return values;
}

function isJsonRecord(value: unknown): value is Json {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
