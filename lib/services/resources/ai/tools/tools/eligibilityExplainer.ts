import { RESOURCE_GUIDE_AI_CONFIG } from "@/lib/services/resources/ai/config";
import { getPrompt } from "@/lib/services/resources/ai/prompts/registry";
import { validateResourceGuideResponse } from "@/lib/services/resources/ai/validation/validator";
import type { ResourceGuideAiMessage } from "@/lib/services/resources/ai/types";
import type {
  EligibilityExplainerInput,
  EligibilityExplainerToolResult,
  GroundedResourceResult,
  ResourceGuideTool,
  ToolExecutionInput,
} from "../types";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

type OpenAIResponsesApiResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
    }>;
  }>;
};

export const eligibilityExplainerTool: ResourceGuideTool = {
  id: "eligibility-explainer",
  name: "Eligibility Explainer",
  async execute(input: ToolExecutionInput): Promise<EligibilityExplainerToolResult> {
    const eligibilityInput = readEligibilityInput(input);
    const response = await callOpenAI(
      buildEligibilityMessages(eligibilityInput)
    );
    const groundedResource = buildGroundedResource(eligibilityInput);
    const validation = validateResourceGuideResponse({
      responseText: response,
      groundedResources: [groundedResource],
    });

    return {
      type: "eligibility_explanation",
      response,
      validation,
    };
  },
};

function readEligibilityInput(input: ToolExecutionInput): EligibilityExplainerInput {
  if (!("resource" in input) || !("question" in input)) {
    throw new Error("resource and question are required");
  }

  const question = input.question.trim();

  if (!question) {
    throw new Error("question is required");
  }

  return {
    resource: input.resource,
    question,
  };
}

function buildEligibilityMessages({
  resource,
  question,
}: EligibilityExplainerInput): ResourceGuideAiMessage[] {
  const prompt = getPrompt("eligibility");

  return [
    {
      role: "system",
      content: prompt.systemPrompt.trim(),
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          userQuestion: question,
          resource: {
            id: resource.id,
            organization: resource.organization,
            eligibility: resource.eligibility,
            tribal_eligibility: resource.tribal_eligibility,
            counties_served: resource.counties_served,
            description: resource.description,
            services: resource.services,
          },
        },
        null,
        2
      ),
    },
  ];
}

function buildGroundedResource({
  resource,
}: EligibilityExplainerInput): GroundedResourceResult {
  return {
    score: 100,
    confidence: "high",
    reasons: [],
    resource: {
      id: resource.id,
      organization: resource.organization,
      description: resource.description,
      services: resource.services,
      eligibility: resource.eligibility,
      tribal_eligibility: resource.tribal_eligibility,
      counties_served: resource.counties_served,
      website: null,
      phone: null,
      application_link: null,
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
      model: RESOURCE_GUIDE_AI_CONFIG.model,
      input: messages,
      reasoning: {
        effort: "low",
      },
      text: {
        verbosity: "low",
      },
      max_output_tokens: 500,
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
