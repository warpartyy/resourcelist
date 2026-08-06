import { buildPrompt } from "./promptBuilder";
import { RESOURCE_GUIDE_AI_CONFIG } from "./config";
import type { ConversationContext } from "./context/types";
import type { ResourceGuidePrompt as RegisteredResourceGuidePrompt } from "./prompts/types";
import type {
  ResourceGuideAiMessage,
  ResourceGuideAiResponse,
} from "./types";
import type { ResourceSearchResponse } from "@/lib/services/resources/intelligence/searchEngine";

export const RESOURCE_GUIDE_AI_MODEL = RESOURCE_GUIDE_AI_CONFIG.model;

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

type GenerateGroundedResourceGuideResponseInput = {
  query: string;
  searchResults: ResourceSearchResponse;
  prompt: RegisteredResourceGuidePrompt;
  conversationContext?: ConversationContext;
};

type OpenAIResponsesApiResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
  }>;
};

export async function generateGroundedResourceGuideResponse({
  query,
  searchResults,
  prompt: selectedPrompt,
  conversationContext,
}: GenerateGroundedResourceGuideResponseInput): Promise<ResourceGuideAiResponse> {
  const startedAt = Date.now();
  const prompt = buildPrompt({
    query,
    searchResults,
    prompt: selectedPrompt,
    conversationContext,
  });
  const message = await callOpenAI(prompt.messages);

  return {
    message,
    metadata: {
      model: RESOURCE_GUIDE_AI_MODEL,
      promptVersion: prompt.promptVersion,
      timestamp: new Date().toISOString(),
      resourceCount: prompt.resourceCount,
      highConfidenceCount: prompt.highConfidenceCount,
      usesFallbackResults: prompt.usesFallbackResults,
      ...(process.env.NODE_ENV === "development"
        ? { selectionTier: prompt.selectionTier }
        : {}),
      responseTimeMs: Date.now() - startedAt,
      normalizedQuery: searchResults.normalizedQuery,
      detectedNeeds: searchResults.detectedNeeds,
      expandedTerms: searchResults.expandedTerms,
      resourceScores: searchResults.results.map((result) => ({
        resourceId: result.resource.id,
        organization: result.resource.organization,
        score: result.score,
        confidence: result.confidence,
      })),
    },
  };
}

async function callOpenAI(messages: ResourceGuideAiMessage[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: RESOURCE_GUIDE_AI_MODEL,
      input: messages,
      reasoning: {
        effort: "low",
      },
      text: {
        verbosity: "low",
      },
      max_output_tokens: 700,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorBody}`);
  }

  const data = (await response.json()) as OpenAIResponsesApiResponse;
  const outputText = extractOutputText(data).trim();

  if (!outputText) {
    throw new Error("OpenAI response did not include output text");
  }

  return outputText;
}

function extractOutputText(data: OpenAIResponsesApiResponse): string {
  if (data.output_text) {
    return data.output_text;
  }

  return (
    data.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text ?? "")
      .join("")
      .trim() ?? ""
  );
}
