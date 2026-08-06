import { selectGroundedResourceResults } from "@/lib/services/resources/ai/grounding";
import { RESOURCE_GUIDE_INTELLIGENCE_EVENT_TYPES, RESOURCE_GUIDE_INTELLIGENCE_EVENT_VERSION } from "./events";
import { extractGeographicIntelligence, extractSearchConcepts } from "./concepts";
import type {
  CollectAnswerIntelligenceInput,
  CollectClarificationIntelligenceInput,
  CollectFeedbackIntelligenceInput,
  CollectResourceClickIntelligenceInput,
  ConversationCompletionReason,
  ResourceGuideIntelligenceEventV1,
  SearchOutcome,
  SearchReformulationIntelligence,
} from "./types";

const DEFAULT_TOOL_ID = "resource-search";

export function buildAnswerIntelligenceEvent({
  id,
  conversationId,
  toolId,
  searchResults,
  aiMetadata,
  evaluation,
  validation,
  recommendedResourceIds,
  selectionTier,
  previousSearchEventId,
  previousSearchTimestamp,
  currentSearchEventId,
  reformulationSequenceNumber,
}: CollectAnswerIntelligenceInput): ResourceGuideIntelligenceEventV1 {
  const selection = selectGroundedResourceResults(searchResults);
  const candidateSelection = searchResults.candidateSelection;

  return {
    id,
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
    journey: {
      searchOutcome: deriveInitialSearchOutcome({
        resourceCount: evaluation.resourceCount,
        highConfidenceCount: evaluation.highConfidenceResults,
      }),
      conversationCompletionReason: "unknown",
      searchReformulation:
        previousSearchEventId && previousSearchTimestamp && currentSearchEventId
          ? buildSearchReformulationIntelligence({
              previousSearchEventId,
              currentSearchEventId,
              currentTimestamp: aiMetadata.timestamp,
              previousTimestamp: previousSearchTimestamp,
              sequenceNumber: reformulationSequenceNumber ?? 1,
            })
          : null,
    },
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
    journey: {
      searchOutcome: "unknown",
      conversationCompletionReason: "unknown",
    },
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
  const timestamp = new Date().toISOString();

  return {
    version: RESOURCE_GUIDE_INTELLIGENCE_EVENT_VERSION,
    eventType: RESOURCE_GUIDE_INTELLIGENCE_EVENT_TYPES.feedbackSubmitted,
    timestamp,
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
    journey: {
      searchOutcome: feedbackType === "helpful" ? "likely_successful" : "unsuccessful",
      conversationCompletionReason: "feedback",
      searchReformulation: null,
    },
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
  recommendationPosition,
  totalRecommendationsShown,
  timeUntilClickMs,
}: CollectResourceClickIntelligenceInput): ResourceGuideIntelligenceEventV1 {
  const timestamp = new Date().toISOString();

  return {
    version: RESOURCE_GUIDE_INTELLIGENCE_EVENT_VERSION,
    eventType: RESOURCE_GUIDE_INTELLIGENCE_EVENT_TYPES.resourceClicked,
    timestamp,
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
    journey: {
      searchOutcome: "likely_successful",
      conversationCompletionReason: "resource_click",
      searchReformulation: null,
      resourceSelection: {
        recommendationPosition: recommendationPosition ?? null,
        totalRecommendationsShown: totalRecommendationsShown ?? null,
        timeUntilClickMs: timeUntilClickMs ?? null,
      },
    },
  };
}

export function buildSearchReformulationIntelligenceEvent({
  conversationId,
  toolId,
  previousSearchEventId,
  currentSearchEventId,
  timeBetweenSearchesMs,
  sequenceNumber,
}: {
  conversationId: string;
  toolId: string;
  previousSearchEventId: string;
  currentSearchEventId: string;
  timeBetweenSearchesMs: number;
  sequenceNumber: number;
}): ResourceGuideIntelligenceEventV1 {
  return {
    version: RESOURCE_GUIDE_INTELLIGENCE_EVENT_VERSION,
    eventType: RESOURCE_GUIDE_INTELLIGENCE_EVENT_TYPES.searchReformulated,
    timestamp: new Date().toISOString(),
    conversationId,
    toolId,
    promptVersion: null,
    model: null,
    detectedNeeds: [],
    searchConcepts: [],
    selectionTier: null,
    candidateCount: 0,
    expandedSearch: false,
    recommendationMode: "search_reformulation",
    recommendedResourceIds: [],
    clickedResourceIds: [],
    resourceCount: 0,
    highConfidenceCount: 0,
    clarificationTriggered: false,
    clarificationReason: null,
    feedbackSubmitted: false,
    feedbackType: null,
    structuredFeedback: null,
    responseTimeMs: null,
    validationPassed: null,
    validationIssueCount: 0,
    journey: {
      searchOutcome: "partially_successful",
      conversationCompletionReason: "another_search",
      searchReformulation: {
        previousSearchEventId,
        currentSearchEventId,
        timeBetweenSearchesMs,
        sequenceNumber,
      },
    },
  };
}

export function buildConversationCompletionIntelligenceEvent({
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
}): ResourceGuideIntelligenceEventV1 {
  return {
    version: RESOURCE_GUIDE_INTELLIGENCE_EVENT_VERSION,
    eventType: RESOURCE_GUIDE_INTELLIGENCE_EVENT_TYPES.conversationCompleted,
    timestamp: new Date().toISOString(),
    conversationId,
    toolId,
    promptVersion: null,
    model: null,
    detectedNeeds: [],
    searchConcepts: [],
    selectionTier: null,
    candidateCount: 0,
    expandedSearch: false,
    recommendationMode: "conversation_completion",
    recommendedResourceIds: [],
    clickedResourceIds: [],
    resourceCount: 0,
    highConfidenceCount: 0,
    clarificationTriggered: false,
    clarificationReason: null,
    feedbackSubmitted: false,
    feedbackType: null,
    structuredFeedback: null,
    responseTimeMs: null,
    validationPassed: null,
    validationIssueCount: 0,
    sourceFeedbackId: sourceFeedbackId ?? null,
    journey: {
      searchOutcome: outcome,
      conversationCompletionReason: reason,
    },
  };
}

function deriveInitialSearchOutcome({
  resourceCount,
  highConfidenceCount,
}: {
  resourceCount: number;
  highConfidenceCount: number;
}): SearchOutcome {
  if (highConfidenceCount > 0) {
    return "likely_successful";
  }

  if (resourceCount > 0) {
    return "partially_successful";
  }

  return "unknown";
}

function buildSearchReformulationIntelligence({
  previousSearchEventId,
  currentSearchEventId,
  currentTimestamp,
  previousTimestamp,
  sequenceNumber,
}: {
  previousSearchEventId: string;
  currentSearchEventId: string;
  currentTimestamp: string;
  previousTimestamp: string;
  sequenceNumber: number;
}): SearchReformulationIntelligence {
  return {
    previousSearchEventId,
    currentSearchEventId,
    timeBetweenSearchesMs: Math.max(
      0,
      new Date(currentTimestamp).getTime() - new Date(previousTimestamp).getTime()
    ),
    sequenceNumber,
  };
}
