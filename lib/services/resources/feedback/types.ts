import type { Json } from "@/lib/database.types";

export type ResourceGuideFeedbackType = "helpful" | "not_helpful";

export type ResourceGuideFeedbackReason =
  | "did_not_understand"
  | "wrong_resources"
  | "missing_resources"
  | "ai_response_unclear"
  | "other";

export type ResourceGuideFeedbackInteractionType =
  | "response_feedback"
  | "resource_click";

export type ResourceGuideFeedbackMetadata = {
  userMessage?: string;
  aiResponse?: string;
  searchMetadata?: Json;
  aiMetadata?: Json;
  selectedResourceIds?: string[];
  promptVersion?: string;
  model?: string;
  normalizedQuery?: string;
  detectedNeeds?: string[];
  expandedTerms?: string[];
};

export type SubmitResourceGuideFeedbackInput = {
  conversationId: string;
  feedback: ResourceGuideFeedbackType;
  reason?: ResourceGuideFeedbackReason;
  clickedResourceId?: string;
  metadata: ResourceGuideFeedbackMetadata;
};

export type TrackResourceGuideClickInput = {
  conversationId: string;
  clickedResourceId: string;
  metadata: ResourceGuideFeedbackMetadata;
};

export type ResourceGuideFeedbackInsert = {
  id?: string;
  conversation_id: string;
  interaction_type: ResourceGuideFeedbackInteractionType;
  user_message?: string | null;
  ai_response?: string | null;
  feedback_type?: ResourceGuideFeedbackType | null;
  feedback_reason?: ResourceGuideFeedbackReason | null;
  search_metadata?: Json;
  ai_metadata?: Json;
  selected_resource_ids?: string[];
  clicked_resource_id?: string | null;
  prompt_version?: string | null;
  model?: string | null;
  normalized_query?: string | null;
  detected_needs?: string[];
  expanded_terms?: string[];
  thumbs_up?: boolean | null;
  thumbs_down?: boolean | null;
};

export type ResourceGuideFeedbackRow = ResourceGuideFeedbackInsert & {
  id: string;
  created_at: string;
  star_rating?: number | null;
  conversation_notes?: string | null;
  admin_reviewed?: boolean;
  resolved?: boolean;
  search_issue?: boolean;
  prompt_issue?: boolean;
  resource_issue?: boolean;
};

export type ResourceGuideFeedbackSummary = {
  helpfulPercent: number;
  totalFeedback: number;
  mostCommonFailureReasons: Array<{ reason: string; count: number }>;
  mostClickedResources: Array<{ resourceId: string; count: number }>;
  queriesWithNoHighConfidenceMatches: string[];
  mostCommonDetectedNeeds: Array<{ need: string; count: number }>;
  averageResponseTimeMs: number;
  promptVersionUsage: Array<{ promptVersion: string; count: number }>;
  modelUsage: Array<{ model: string; count: number }>;
};
