import type { Json } from "@/lib/database.types";
import type { GroundedResourceSelectionTier } from "@/lib/services/resources/ai/grounding";
import type { AiStructuredFeedback } from "@/lib/services/resources/ai/feedback/types";
import type { ResourceSearchResponse } from "@/lib/services/resources/intelligence/searchEngine";
import type { ResourceGuideAiMetadata } from "@/lib/services/resources/ai/types";
import type { ResourceGuideEvaluation } from "@/lib/services/resources/ai/evaluation/types";
import type { ValidationResult } from "@/lib/services/resources/ai/validation/types";
import type { ResourceGuideIntelligenceEventType } from "./events";

export type GeographicIntelligence = {
  city?: string;
  county?: string;
  state?: string;
};

export type SearchOutcome =
  | "likely_successful"
  | "partially_successful"
  | "unsuccessful"
  | "abandoned"
  | "unknown";

export type ConversationCompletionReason =
  | "resource_click"
  | "feedback"
  | "another_search"
  | "abandonment"
  | "unknown";

export type SearchReformulationIntelligence = {
  previousSearchEventId: string;
  currentSearchEventId?: string | null;
  timeBetweenSearchesMs: number;
  sequenceNumber: number;
};

export type ResourceSelectionIntelligence = {
  recommendationPosition?: number | null;
  totalRecommendationsShown?: number | null;
  timeUntilClickMs?: number | null;
};

export type JourneyIntelligence = {
  searchOutcome?: SearchOutcome;
  conversationCompletionReason?: ConversationCompletionReason;
  searchReformulation?: SearchReformulationIntelligence | null;
  resourceSelection?: ResourceSelectionIntelligence | null;
};

export type ResourceGuideIntelligenceEventV1 = {
  id?: string;
  version: "v1";
  eventType: ResourceGuideIntelligenceEventType;
  timestamp: string;
  conversationId: string;
  toolId: string;
  promptVersion?: string | null;
  model?: string | null;
  detectedNeeds: string[];
  searchConcepts: string[];
  location?: GeographicIntelligence;
  selectionTier?: GroundedResourceSelectionTier | null;
  candidateCount: number;
  expandedSearch: boolean;
  recommendationMode: string;
  recommendedResourceIds: string[];
  clickedResourceIds: string[];
  resourceCount: number;
  highConfidenceCount: number;
  clarificationTriggered: boolean;
  clarificationReason?: string | null;
  feedbackSubmitted: boolean;
  feedbackType?: "helpful" | "not_helpful" | null;
  structuredFeedback?: AiStructuredFeedback | null;
  responseTimeMs?: number | null;
  validationPassed?: boolean | null;
  validationIssueCount: number;
  sourceFeedbackId?: string | null;
  confidence?: string | null;
  journey?: JourneyIntelligence;
};

export type ResourceGuideIntelligenceEvent =
  ResourceGuideIntelligenceEventV1;

export type ResourceGuideIntelligenceStorageInsert = {
  id?: string;
  version: ResourceGuideIntelligenceEventV1["version"];
  event_type: ResourceGuideIntelligenceEventType;
  conversation_id: string;
  tool_id: string;
  prompt_version?: string | null;
  model?: string | null;
  detected_needs?: string[];
  search_concepts?: string[];
  city?: string | null;
  county?: string | null;
  state?: string | null;
  selection_tier?: string | null;
  candidate_count?: number;
  expanded_search?: boolean;
  recommendation_mode?: string | null;
  recommended_resource_ids?: string[];
  clicked_resource_ids?: string[];
  resource_count?: number;
  high_confidence_count?: number;
  clarification_triggered?: boolean;
  clarification_reason?: string | null;
  feedback_submitted?: boolean;
  feedback_type?: string | null;
  structured_feedback?: Json;
  response_time_ms?: number | null;
  validation_passed?: boolean | null;
  validation_issue_count?: number;
  metadata?: Json;
};

export type CollectAnswerIntelligenceInput = {
  id?: string;
  conversationId: string;
  toolId: string;
  searchResults: ResourceSearchResponse;
  aiMetadata: ResourceGuideAiMetadata;
  evaluation: ResourceGuideEvaluation;
  validation: ValidationResult;
  recommendedResourceIds: string[];
  selectionTier?: GroundedResourceSelectionTier;
  previousSearchEventId?: string | null;
  previousSearchTimestamp?: string | null;
  currentSearchEventId?: string | null;
  reformulationSequenceNumber?: number | null;
};

export type CollectClarificationIntelligenceInput = {
  conversationId: string;
  toolId: string;
  searchResults: ResourceSearchResponse;
  reason: string;
};

export type CollectFeedbackIntelligenceInput = {
  conversationId: string;
  toolId?: string;
  promptVersion?: string | null;
  model?: string | null;
  detectedNeeds?: string[];
  expandedTerms?: string[];
  normalizedQuery?: string | null;
  resourceIds?: string[];
  feedbackType: "helpful" | "not_helpful";
  structuredFeedback?: AiStructuredFeedback | null;
  confidence?: string | null;
  feedbackId?: string;
  searchEventId?: string | null;
  searchEventTimestamp?: string | null;
};

export type CollectResourceClickIntelligenceInput = {
  conversationId: string;
  toolId?: string;
  promptVersion?: string | null;
  model?: string | null;
  detectedNeeds?: string[];
  expandedTerms?: string[];
  normalizedQuery?: string | null;
  resourceIds?: string[];
  clickedResourceId: string;
  confidence?: string | null;
  feedbackId?: string;
  recommendationPosition?: number | null;
  totalRecommendationsShown?: number | null;
  timeUntilClickMs?: number | null;
  searchEventId?: string | null;
  searchEventTimestamp?: string | null;
};
