import { RESOURCE_GUIDE_AI_CONFIG } from "../config";
import type { ResourceGuideAiMessage } from "../types";
import { buildAiRequestUnderstandingMessages } from "./prompt";
import {
  AI_REQUEST_UNDERSTANDING_JSON_SCHEMA,
  getEmptyAiRequestUnderstanding,
  parseAiRequestUnderstandingJson,
} from "./schema";
import type {
  AiRequestUnderstanding,
  ExtractAiRequestUnderstandingInput,
} from "./types";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

type OpenAIResponsesApiResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
  }>;
};

export async function extractAiRequestUnderstanding({
  message,
}: ExtractAiRequestUnderstandingInput): Promise<AiRequestUnderstanding> {
  if (!message.trim()) {
    return getEmptyAiRequestUnderstanding();
  }

  try {
    const rawJson = await callOpenAIForStructuredUnderstanding(
      buildAiRequestUnderstandingMessages(message)
    );
    return parseAiRequestUnderstandingJson(rawJson);
  } catch (error) {
    console.error("AI request understanding extraction failed", error);
    return getEmptyAiRequestUnderstanding();
  }
}

async function callOpenAIForStructuredUnderstanding(
  messages: ResourceGuideAiMessage[]
): Promise<unknown> {
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
      model: RESOURCE_GUIDE_AI_CONFIG.model,
      input: messages,
      reasoning: {
        effort: "low",
      },
      text: {
        format: {
          type: "json_schema",
          name: "resource_guide_request_understanding",
          strict: true,
          schema: AI_REQUEST_UNDERSTANDING_JSON_SCHEMA,
        },
      },
      max_output_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorBody}`);
  }

  const data = (await response.json()) as OpenAIResponsesApiResponse;
  const outputText = extractOutputText(data);

  if (!outputText) {
    throw new Error("OpenAI response did not include output text");
  }

  return JSON.parse(outputText) as unknown;
}

function extractOutputText(data: OpenAIResponsesApiResponse): string {
  if (data.output_text) {
    return data.output_text.trim();
  }

  return (
    data.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text ?? "")
      .join("")
      .trim() ?? ""
  );
}
