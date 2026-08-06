import type {
  ResourceSearchResponse,
  ResourceSearchResult,
} from "@/lib/services/resources/intelligence/searchEngine";

export const MAX_GROUNDED_RESOURCE_RESULTS = 5;

export type GroundedResourceSelectionMode =
  | "high_confidence"
  | "medium_confidence"
  | "fallback_top_ranked";

export type GroundedResourceSelectionTier = "high" | "medium" | "fallback";

export type GroundedResourceSelection = {
  results: ResourceSearchResult[];
  highConfidenceResults: ResourceSearchResult[];
  mediumConfidenceResults: ResourceSearchResult[];
  usesFallbackResults: boolean;
  selectionMode: GroundedResourceSelectionMode;
  selectionTier: GroundedResourceSelectionTier;
  note?: string;
};

export const FALLBACK_GROUNDED_RESULTS_NOTE =
  "These are the closest verified matches found in the directory. They may not exactly match the user's request but are the most relevant resources available based on deterministic search.";

export function selectGroundedResourceResults(
  searchResults: ResourceSearchResponse
): GroundedResourceSelection {
  const highConfidenceResults = searchResults.results.filter(
    (result) => result.confidence === "high"
  );
  const mediumConfidenceResults = searchResults.results.filter(
    (result) => result.confidence === "medium"
  );

  if (highConfidenceResults.length > 0) {
    return {
      results: highConfidenceResults.slice(0, MAX_GROUNDED_RESOURCE_RESULTS),
      highConfidenceResults,
      mediumConfidenceResults,
      usesFallbackResults: false,
      selectionMode: "high_confidence",
      selectionTier: "high",
    };
  }

  if (mediumConfidenceResults.length > 0) {
    return {
      results: mediumConfidenceResults,
      highConfidenceResults,
      mediumConfidenceResults,
      usesFallbackResults: false,
      selectionMode: "medium_confidence",
      selectionTier: "medium",
    };
  }

  return {
    results: searchResults.results.slice(0, MAX_GROUNDED_RESOURCE_RESULTS),
    highConfidenceResults,
    mediumConfidenceResults,
    usesFallbackResults: searchResults.results.length > 0,
    selectionMode: "fallback_top_ranked",
    selectionTier: "fallback",
    note:
      searchResults.results.length > 0
        ? FALLBACK_GROUNDED_RESULTS_NOTE
        : undefined,
  };
}
