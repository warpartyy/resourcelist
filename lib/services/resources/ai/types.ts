import type {
  ResourceSearchResponse,
  ResourceSearchResult,
  ResourceCandidateSelection,
} from "@/lib/services/resources/intelligence/searchEngine";
import type { ConversationContext } from "./context/types";
import type { ResourceGuidePrompt as RegisteredResourceGuidePrompt } from "./prompts/types";
import type { GroundedResourceSelectionTier } from "./grounding";

export type ResourceGuideAiRole = "system" | "user";

export type ResourceGuideAiMessage = {
  role: ResourceGuideAiRole;
  content: string;
};

export type BuildResourceGuidePromptInput = {
  query: string;
  searchResults: ResourceSearchResponse;
  prompt: RegisteredResourceGuidePrompt;
  conversationContext?: ConversationContext;
};

export type ResourceGuidePrompt = {
  messages: ResourceGuideAiMessage[];
  promptVersion: string;
  resourceCount: number;
  highConfidenceCount: number;
  usesFallbackResults: boolean;
  selectionTier: GroundedResourceSelectionTier;
};

export type GroundedResourceResult = Pick<
  ResourceSearchResult,
  "resource" | "score" | "confidence" | "reasons"
>;

export type ResourceGuideAiMetadata = {
  model: string;
  promptVersion: string;
  timestamp: string;
  resourceCount: number;
  highConfidenceCount: number;
  usesFallbackResults: boolean;
  selectionTier?: GroundedResourceSelectionTier;
  candidateSelection?: ResourceCandidateSelection;
  responseTimeMs: number;
  normalizedQuery: string;
  detectedNeeds: string[];
  expandedTerms: string[];
  resourceScores: Array<{
    resourceId: string;
    organization: string | null;
    score: number;
    confidence: string;
  }>;
};

export type ResourceGuideAiResponse = {
  message: string;
  metadata: ResourceGuideAiMetadata;
};
