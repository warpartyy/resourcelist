import type { Database, Json } from "@/lib/database.types";

export type AiFeedbackStorageRow =
  Database["public"]["Tables"]["resource_guide_feedback"]["Row"];

export type AiFeedbackStorageInsert =
  Database["public"]["Tables"]["resource_guide_feedback"]["Insert"];

export type AiFeedbackConfidence = "high" | "medium" | "low" | "none";

export interface AiFeedbackMetadata {
  searchMetadata?: Json;
  aiMetadata?: Json;
  normalizedQuery?: string;
  detectedNeeds?: string[];
  expandedTerms?: string[];
}

export interface AiStructuredFeedback {
  sentiment: "helpful" | "not_helpful";
  selections: string[];
  otherText?: string | null;
}

export interface SubmitAiFeedbackInput {
  conversationId: string;
  helpful: boolean | null;
  feedbackText?: string | null;
  toolId?: string;
  promptVersion?: string;
  model?: string;
  query?: string;
  response?: string;
  resourceIds?: string[];
  confidence?: AiFeedbackConfidence;
  reason?: string;
  structuredFeedback?: AiStructuredFeedback;
  metadata?: AiFeedbackMetadata;
}

export interface TrackAiResourceClickInput {
  conversationId: string;
  clickedResourceId: string;
  toolId?: string;
  promptVersion?: string;
  model?: string;
  query?: string;
  response?: string;
  resourceIds?: string[];
  confidence?: AiFeedbackConfidence;
  metadata?: AiFeedbackMetadata;
}

export interface AiFeedbackReport {
  totalFeedback: number;
  helpfulRate: number;
  feedbackByPromptVersion: Array<{ promptVersion: string; count: number }>;
  feedbackByTool: Array<{ toolId: string; count: number }>;
  mostCommonNegativeComments: Array<{ comment: string; count: number }>;
}
