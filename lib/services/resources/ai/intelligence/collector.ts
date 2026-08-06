import { selectGroundedResourceResults } from "@/lib/services/resources/ai/grounding";
import { RESOURCE_GUIDE_INTELLIGENCE_EVENT_TYPES, RESOURCE_GUIDE_INTELLIGENCE_EVENT_VERSION } from "./events";
import { extractGeographicIntelligence, extractSearchConcepts } from "./concepts";
import type {
  CollectAnswerIntelligenceInput,
  CollectClarificationIntelligenceInput,
  CollectFeedbackIntelligenceInput,
  CollectResourceClickIntelligenceInput,
  ResourceGuideIntelligenceEventV1,
} from "./types";

const DEFAULT_TOOL_ID = "resource-search";

export function buildAnswerIntelligenceEvent({
  conversationId,
  toolId,
  searchResults,
  aiMetadata,
  evaluation,
  validation,
  recommendedResourceIds,
  selectionTier,
}: CollectAnswerIntelligenceInput): ResourceGuideIntelligenceEventV1 {
  const selection = selectGroundedResourceResults(searchResults);
  const candidateSelection = searchResults.candidateSelection;

  return {
    version: RESOURCE_GUIDE_INTELLIGENCE_EVENT_VERSION,
    eventType: RESOURCE_GUIDE_INTELLIGENCE_EVENT_TYPES.answerReturned,
    timestamp: aiMetadata.timestamp,
    conversationId,
    toolId,
    promptVersion: aiMetadata.promptVersion,
    model: aiMetadata.model,
    detectedNeeds: searchResults.detectedNeeds,
    searchConcepts: extractSearchConcepts({
      normalizedQuery: searchResults.normalizedQuery,
      expandedTerms: searchResults.expandedTerms,
    }),
    location: extractGeographicIntelligence(searchResults),
    selectionTier: selectionTier ?? selection.selectionTier,
    candidateCount: candidateSelection.candidateResourceCount,
    expandedSearch: candidateSelection.expandedSearch,
    recommendationMode: candidateSelection.recommendationMode,
    recommendedResourceIds,
    clickedResourceIds: [],
    resourceCount: evaluation.resourceCount,
    highConfidenceCount: evaluation.highConfidenceResults,
    clarificationTriggered: false,
    clarificationReason: null,
    feedbackSubmitted: false,
    feedbackType: null,
    structuredFeedback: null,
    responseTimeMs: evaluation.responseTimeMs,
    validationPassed: validation.passed,
    validationIssueCount: validation.issues.length,
  };
}

export function buildClarificationIntelligenceEvent({
  conversationId,
  toolId,
  searchResults,
  reason,
}: CollectClarificationIntelligenceInput): ResourceGuideIntelligenceEventV1 {
  const candidateSelection = searchResults.candidateSelection;

  return {
    version: RESOURCE_GUIDE_INTELLIGENCE_EVENT_VERSION,
    eventType: RESOURCE_GUIDE_INTELLIGENCE_EVENT_TYPES.clarificationReturned,
    timestamp: new Date().toISOString(),
    conversationId,
    toolId,
    promptVersion: null,
    model: null,
    detectedNeeds: searchResults.detectedNeeds,
    searchConcepts: extractSearchConcepts({
      normalizedQuery: searchResults.normalizedQuery,
      expandedTerms: searchResults.expandedTerms,
    }),
    location: extractGeographicIntelligence(searchResults),
    selectionTier: null,
    candidateCount: candidateSelection.candidateResourceCount,
    expandedSearch: candidateSelection.expandedSearch,
    recommendationMode: candidateSelection.recommendationMode,
    recommendedResourceIds: [],
    clickedResourceIds: [],
    resourceCount: searchResults.results.length,
    highConfidenceCount: searchResults.results.filter(
      (result) => result.confidence === "high"
    ).length,
    clarificationTriggered: true,
    clarificationReason: reason,
    feedbackSubmitted: false,
    feedbackType: null,
    structuredFeedback: null,
    responseTimeMs: null,
    validationPassed: null,
    validationIssueCount: 0,
  };
}

export function buildFeedbackIntelligenceEvent({
  conversationId,
  toolId,
  promptVersion,
  model,
  detectedNeeds,
  expandedTerms,
  normalizedQuery,
  resourceIds,
  feedbackType,
  structuredFeedback,
  confidence,
  feedbackId,
}: CollectFeedbackIntelligenceInput): ResourceGuideIntelligenceEventV1 {
  return {
    version: RESOURCE_GUIDE_INTELLIGENCE_EVENT_VERSION,
    eventType: RESOURCE_GUIDE_INTELLIGENCE_EVENT_TYPES.feedbackSubmitted,
    timestamp: new Date().toISOString(),
    conversationId,
    toolId: toolId ?? DEFAULT_TOOL_ID,
    promptVersion: promptVersion ?? null,
    model: model ?? null,
    detectedNeeds: detectedNeeds ?? [],
    searchConcepts: extractSearchConcepts({
      normalizedQuery,
      expandedTerms,
    }),
    selectionTier: null,
    candidateCount: 0,
    expandedSearch: false,
    recommendationMode: "feedback",
    recommendedResourceIds: resourceIds ?? [],
    clickedResourceIds: [],
    resourceCount: resourceIds?.length ?? 0,
    highConfidenceCount: 0,
    clarificationTriggered: false,
    clarificationReason: null,
    feedbackSubmitted: true,
    feedbackType,
    structuredFeedback: structuredFeedback ?? null,
    responseTimeMs: null,
    validationPassed: null,
    validationIssueCount: 0,
    sourceFeedbackId: feedbackId ?? null,
    confidence: confidence ?? null,
  };
}

export function buildResourceClickIntelligenceEvent({
  conversationId,
  toolId,
  promptVersion,
  model,
  detectedNeeds,
  expandedTerms,
  normalizedQuery,
  resourceIds,
  clickedResourceId,
  confidence,
  feedbackId,
}: CollectResourceClickIntelligenceInput): ResourceGuideIntelligenceEventV1 {
  return {
    version: RESOURCE_GUIDE_INTELLIGENCE_EVENT_VERSION,
    eventType: RESOURCE_GUIDE_INTELLIGENCE_EVENT_TYPES.resourceClicked,
    timestamp: new Date().toISOString(),
    conversationId,
    toolId: toolId ?? DEFAULT_TOOL_ID,
    promptVersion: promptVersion ?? null,
    model: model ?? null,
    detectedNeeds: detectedNeeds ?? [],
    searchConcepts: extractSearchConcepts({
      normalizedQuery,
      expandedTerms,
    }),
    selectionTier: null,
    candidateCount: 0,
    expandedSearch: false,
    recommendationMode: "resource_click",
    recommendedResourceIds: resourceIds ?? [],
    clickedResourceIds: [clickedResourceId],
    resourceCount: resourceIds?.length ?? 0,
    highConfidenceCount: 0,
    clarificationTriggered: false,
    clarificationReason: null,
    feedbackSubmitted: false,
    feedbackType: null,
    structuredFeedback: null,
    responseTimeMs: null,
    validationPassed: null,
    validationIssueCount: 0,
    sourceFeedbackId: feedbackId ?? null,
    confidence: confidence ?? null,
  };
}
