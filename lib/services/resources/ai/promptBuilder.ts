import type {
  BuildResourceGuidePromptInput,
  ResourceGuidePrompt,
} from "./types";
import { selectGroundedResourceResults } from "./grounding";

export function buildPrompt({
  query,
  searchResults,
  prompt,
  conversationContext,
}: BuildResourceGuidePromptInput): ResourceGuidePrompt {
  const groundedSelection = selectGroundedResourceResults(searchResults);
  const groundedResults = groundedSelection.results;

  return {
    promptVersion: prompt.version,
    resourceCount: groundedResults.length,
    highConfidenceCount: groundedResults.filter(
      (result) => result.confidence === "high"
    ).length,
    usesFallbackResults: groundedSelection.usesFallbackResults,
    selectionTier: groundedSelection.selectionTier,
    messages: [
      {
        role: "system",
        content: prompt.systemPrompt.trim(),
      },
      {
        role: "user",
        content: JSON.stringify(
          {
            conversationContext: conversationContext
              ? {
                  conversationId: conversationContext.conversationId,
                  retainedTurns: conversationContext.turns,
                }
              : undefined,
            userQuery: query,
            searchEngineOutput: {
              normalizedQuery: searchResults.normalizedQuery,
              detectedNeeds: searchResults.detectedNeeds,
              expandedTerms: searchResults.expandedTerms,
              resourceSelection: {
                mode: groundedSelection.selectionMode,
                tier: groundedSelection.selectionTier,
                usesFallbackResults: groundedSelection.usesFallbackResults,
                note: groundedSelection.note,
              },
              suppliedResources: groundedResults.map((result) => ({
                score: result.score,
                confidence: result.confidence,
                reasons: result.reasons,
                resource: {
                  organization: result.resource.organization,
                  description: result.resource.description,
                  services: result.resource.services,
                  eligibility: result.resource.eligibility,
                  tribal_eligibility: result.resource.tribal_eligibility,
                  counties_served: result.resource.counties_served,
                  website: result.resource.website,
                  phone: result.resource.phone,
                  application_link: result.resource.application_link,
                },
              })),
              suppliedHighConfidenceResources:
                groundedSelection.selectionTier !== "high"
                  ? []
                  : groundedResults.map((result) => ({
                      score: result.score,
                      confidence: result.confidence,
                      reasons: result.reasons,
                      resource: {
                        organization: result.resource.organization,
                        description: result.resource.description,
                        services: result.resource.services,
                        eligibility: result.resource.eligibility,
                        tribal_eligibility: result.resource.tribal_eligibility,
                        counties_served: result.resource.counties_served,
                        website: result.resource.website,
                        phone: result.resource.phone,
                        application_link: result.resource.application_link,
                      },
                    })),
              suppliedMediumConfidenceResources:
                groundedSelection.selectionTier !== "medium"
                  ? []
                  : groundedResults.map((result) => ({
                      score: result.score,
                      confidence: result.confidence,
                      reasons: result.reasons,
                      resource: {
                        organization: result.resource.organization,
                        description: result.resource.description,
                        services: result.resource.services,
                        eligibility: result.resource.eligibility,
                        tribal_eligibility: result.resource.tribal_eligibility,
                        counties_served: result.resource.counties_served,
                        website: result.resource.website,
                        phone: result.resource.phone,
                        application_link: result.resource.application_link,
                      },
                    })),
            },
          },
          null,
          2
        ),
      },
    ],
  };
}
