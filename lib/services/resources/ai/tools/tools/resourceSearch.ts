import { generateGroundedResourceGuideResponse } from "@/lib/services/resources/ai/chatService";
import { determineClarification } from "@/lib/services/resources/ai/clarification/engine";
import { getPromptContextTurns } from "@/lib/services/resources/ai/context/context";
import {
  appendAssistantMessage,
  appendUserMessage,
  createConversation,
  getConversation,
} from "@/lib/services/resources/ai/context/manager";
import { buildEvaluationRecord } from "@/lib/services/resources/ai/evaluation/evaluation";
import { RESOURCE_GUIDE_AI_CONFIG } from "@/lib/services/resources/ai/config";
import { selectGroundedResourceResults } from "@/lib/services/resources/ai/grounding";
import { getPrompt } from "@/lib/services/resources/ai/prompts/registry";
import { validateResourceGuideResponse } from "@/lib/services/resources/ai/validation/validator";
import { fetchApprovedResources } from "@/lib/services/resources/approvedResourcesProvider";
import {
  SEARCH_CONFIDENCE_THRESHOLDS,
  searchResources,
  type ResourceSearchResult,
} from "@/lib/services/resources/intelligence/searchEngine";
import type {
  GroundedResourceResult,
  ResourceGuideTool,
  ResourceSearchToolInput,
  SearchMetadataResult,
  ToolExecutionInput,
  ToolExecutionResult,
} from "../types";

const COMANCHE_COUNTY_MEMORIAL_HOSPITAL = "Comanche County Memorial Hospital";

export const resourceSearchTool: ResourceGuideTool = {
  id: "resource-search",
  name: "Resource Search",
  async execute(input: ToolExecutionInput): Promise<ToolExecutionResult> {
    const searchInput = readResourceSearchInput(input);
    const message = searchInput.message?.trim();

    if (!message) {
      throw new Error("message is required");
    }

    const existingConversation = searchInput.conversationId
      ? getConversation(searchInput.conversationId)
      : null;
    const conversation =
      existingConversation ??
      createConversation(
        searchInput.conversationId ? { conversationId: searchInput.conversationId } : {}
      );
    const updatedConversation = appendUserMessage(
      conversation.conversationId,
      message
    );
    const promptContext = {
      ...updatedConversation,
      turns: getPromptContextTurns(updatedConversation, message),
    };
    const resources = await fetchApprovedResources();
    logResourceSearchStage("approved_resources_loaded", {
      count: resources.length,
      comancheCountyMemorialHospitalPresent: resources.some(
        (resource) =>
          resource.organization === COMANCHE_COUNTY_MEMORIAL_HOSPITAL
      ),
    });

    const searchResults = searchResources({
      query: message,
      resources,
    });
    logResourceSearchStage("deterministic_search_completed", {
      normalizedQuery: searchResults.normalizedQuery,
      detectedNeeds: searchResults.detectedNeeds,
      expandedTerms: searchResults.expandedTerms,
      confidenceThreshold: SEARCH_CONFIDENCE_THRESHOLDS,
      topRankedResources: searchResults.results.slice(0, 10).map((result) => ({
        organization: result.resource.organization,
        score: result.score,
        scoreBreakdown: getScoreBreakdown(result),
        matchedFields: getMatchedFields(result),
        confidence: result.confidence,
      })),
      highConfidenceMatches: searchResults.results
        .filter((result) => result.confidence === "high")
        .map((result) => ({
          organization: result.resource.organization,
          score: result.score,
        })),
    });

    const clarification = determineClarification({ searchResults });

    if (clarification.action === "clarify") {
      const clarificationResult = {
        type: "clarification" as const,
        conversationId: updatedConversation.conversationId,
        question: clarification.question,
        options: clarification.options,
      };
      logResourceSearchStage("final_response_returned_to_ui", {
        openAiInvoked: false,
        response: clarificationResult,
      });

      return clarificationResult;
    }

    const prompt = getPrompt(
      process.env.NODE_ENV === "development"
        ? searchInput.promptVersion
        : RESOURCE_GUIDE_AI_CONFIG.defaultPromptVersion
    );
    logResourceSearchStage("openai_invocation", {
      openAiInvoked: true,
      promptVersion: prompt.version,
    });

    const response = await generateGroundedResourceGuideResponse({
      query: message,
      searchResults,
      prompt,
      conversationContext: promptContext,
    });
    appendAssistantMessage(updatedConversation.conversationId, response.message);

    const groundedResults = getGroundedResultsForClient(searchResults);
    const searchMetadata = buildSearchMetadata(searchResults);
    const validation = validateResourceGuideResponse({
      responseText: response.message,
      groundedResources: groundedResults,
      searchMetadata,
    });
    const evaluation = buildEvaluationRecord({
      userQuery: message,
      searchResults,
      aiMetadata: response.metadata,
      aiResponse: response.message,
      validationResult: validation,
    });

    const result = {
      type: "answer" as const,
      conversationId: updatedConversation.conversationId,
      response: response.message,
      metadata: response.metadata,
      searchMetadata,
      groundedResults,
      ...(process.env.NODE_ENV === "development"
        ? { evaluation, validation }
        : {}),
    };
    logResourceSearchStage("final_response_returned_to_ui", {
      openAiInvoked: true,
      response: {
        type: result.type,
        conversationId: result.conversationId,
        response: result.response,
        metadata: result.metadata,
        groundedResults: result.groundedResults.map((groundedResult) => ({
          organization: groundedResult.resource.organization,
          score: groundedResult.score,
          confidence: groundedResult.confidence,
        })),
      },
    });

    return result;
  },
};

function readResourceSearchInput(input: ToolExecutionInput): ResourceSearchToolInput {
  if ("resource" in input || "question" in input) {
    throw new Error("message is required");
  }

  return input;
}

function buildSearchMetadata(
  searchResults: ReturnType<typeof searchResources>
): SearchMetadataResult {
  return {
    normalizedQuery: searchResults.normalizedQuery,
    detectedNeeds: searchResults.detectedNeeds,
    expandedTerms: searchResults.expandedTerms,
    results: searchResults.results.map((result) => ({
      resourceId: result.resource.id,
      score: result.score,
      confidence: result.confidence,
      reasons: result.reasons,
    })),
  };
}

function getGroundedResultsForClient(
  searchResults: ReturnType<typeof searchResources>
): GroundedResourceResult[] {
  const selection = selectGroundedResourceResults(searchResults);

  return selection.results.map((result) => ({
    score: result.score,
    confidence: result.confidence,
    isFallbackMatch: selection.usesFallbackResults,
    selectionTier: selection.selectionTier,
    reasons: result.reasons,
    resource: {
      id: result.resource.id,
      organization: result.resource.organization,
      description: result.resource.description,
      services: result.resource.services,
      parent_categories: result.resource.parent_categories,
      subcategories: result.resource.subcategories,
      eligibility: result.resource.eligibility,
      tribal_eligibility: result.resource.tribal_eligibility,
      counties_served: result.resource.counties_served,
      website: result.resource.website,
      phone: result.resource.phone,
      application_link: result.resource.application_link,
      last_verified: result.resource.last_verified,
    },
  }));
}

function logResourceSearchStage(stage: string, payload: unknown) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.info("[resource-search]", stage, payload);
}

function getScoreBreakdown(result: ResourceSearchResult): Record<string, number> {
  return result.reasons.reduce<Record<string, number>>((breakdown, reason) => {
    breakdown[reason.field] = (breakdown[reason.field] ?? 0) + reason.points;
    return breakdown;
  }, {});
}

function getMatchedFields(result: ResourceSearchResult): string[] {
  return Array.from(new Set(result.reasons.map((reason) => reason.field)));
}
