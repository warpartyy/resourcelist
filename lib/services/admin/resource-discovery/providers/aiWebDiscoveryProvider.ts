import { RESOURCE_GUIDE_AI_CONFIG } from "@/lib/services/resources/ai/config";
import { getProviderPriority } from "../evidence-acquisition/providerPriority";
import {
  emptyProviderResult,
  getProviderMetadata,
  type EvidenceProviderResult,
  type OrganizationDiscoveryInput,
  type OrganizationDiscoveryResult,
  type ResourceDiscoveryEvidenceProvider,
} from "./baseProvider";
import type { OrganizationCandidate } from "../organization-discovery/candidate";
import {
  ResourceDiscoveryResearchStatus,
  type ResourceDiscoveryCandidate,
} from "../types";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const MAX_CANDIDATES = 5;

type DiscoveryResponse = {
  candidates?: AiDiscoveredCandidate[];
};

type AiDiscoveredCandidate = {
  organization?: string;
  website?: string;
  reason?: string;
};

type OpenAIResponsesApiResponse = {
  id?: string;
  status?: string;
  output_text?: string;
  error?: {
    code?: string;
    message?: string;
    type?: string;
    param?: string;
  } | null;
  incomplete_details?: {
    reason?: string;
  } | null;
  output?: Array<{
    id?: string;
    type?: string;
    status?: string;
    error?: {
      code?: string;
      message?: string;
      type?: string;
    } | null;
    content?: Array<{
      text?: string;
      type?: string;
      parsed?: unknown;
      refusal?: string;
    }>;
  }>;
};

export const aiWebDiscoveryProvider: ResourceDiscoveryEvidenceProvider = {
  name: "AI Web Discovery Provider",
  version: "v1",
  priority: getProviderPriority("community_directory"),
  type: "community_directory",
  supportsDiscovery: true,
  supportsEvidenceCollection: false,
  getMetadata() {
    return getProviderMetadata(this);
  },
  async discoverOrganizations(
    input: OrganizationDiscoveryInput,
  ): Promise<OrganizationDiscoveryResult> {
    const discovered = await discoverWithOpenAi(input);

    return {
      providerName: this.name,
      providerType: this.type,
      candidates: discovered.organizationCandidates,
    };
  },
  async collectEvidence(): Promise<EvidenceProviderResult> {
    return emptyProviderResult(this);
  },
};

export async function discoverPotentialResourcesWithAi(
  input: OrganizationDiscoveryInput,
): Promise<ResourceDiscoveryCandidate[]> {
  const discovered = await discoverWithOpenAi(input);
  return discovered.resourceCandidates;
}

async function discoverWithOpenAi(input: OrganizationDiscoveryInput) {
  const parsed = await callOpenAiDiscovery(input);
  const candidates = (parsed.candidates ?? [])
    .map((candidate) => normalizeAiCandidate(candidate, input))
    .filter((candidate): candidate is ResourceDiscoveryCandidate =>
      Boolean(candidate?.organization && candidate.website),
    )
    .slice(0, input.plan.maximumResults);

  return {
    resourceCandidates: candidates,
    organizationCandidates: candidates.map(toOrganizationCandidate),
  };
}

async function callOpenAiDiscovery(
  input: OrganizationDiscoveryInput,
): Promise<DiscoveryResponse> {
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
      input: buildDiscoveryPrompt(input),
      tools: [{ type: "web_search_preview" }],
      reasoning: {
        effort: "low",
      },
      text: {
        format: {
          type: "json_schema",
          name: "resource_discovery_candidates",
          strict: true,
          schema: DISCOVERY_SCHEMA,
        },
      },
      max_output_tokens: 700,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI discovery request failed: ${response.status} ${errorBody}`);
  }

  const data = (await response.json()) as OpenAIResponsesApiResponse;
  logRawOpenAiDiscoveryPayload(data);
  const output = extractStructuredDiscoveryOutput(data);

  if (!output) {
    logEmptyOpenAiDiscoveryOutput(data);
    return { candidates: [] };
  }

  if (typeof output === "object") {
    return output as DiscoveryResponse;
  }

  console.info("Resource Discovery OpenAI output before JSON.parse", {
    rawResponsesApiPayload: data,
    output,
    outputType: typeof output,
    isUndefined: output === undefined,
    isNull: output === null,
    isEmptyString: output === "",
  });

  try {
    return JSON.parse(output) as DiscoveryResponse;
  } catch (error) {
    console.error("Resource Discovery JSON parse failed", {
      rawResponsesApiPayload: data,
      rawOutputThatCausedException: output,
      output,
      outputPreview: output.slice(0, 500),
      outputType: typeof output,
      isUndefined: output === undefined,
      isNull: output === null,
      isEmptyString: output === "",
      responseId: data.id,
      status: data.status,
    });
    throw error;
  }
}

function buildDiscoveryPrompt({ plan, searchStrategies }: OrganizationDiscoveryInput) {
  return [
    {
      role: "system",
      content: [
        "You are a research assistant for a verified resource directory.",
        "Find real organizations only when supported by web evidence.",
        "Do not create resources, approve resources, or invent missing fields.",
        "Return structured JSON only.",
        "Every candidate must include only organization, official website, and one concise reason.",
        "Prefer official organization, government, tribal, health system, or nonprofit pages.",
      ].join(" "),
    },
    {
      role: "user",
      content: [
        plan.searchObjective,
        "",
        `State: ${plan.geography.state || "Not specified"}`,
        `County: ${plan.geography.county || "Not specified"}`,
        `City: ${plan.geography.city || "Not specified"}`,
        `Parent category: ${plan.serviceCategory.parentCategory || "Not specified"}`,
        `Subcategory: ${plan.serviceCategory.subcategory}`,
        `Gap priority: ${plan.priority}`,
        "",
        "Use these deterministic search phrases as the research plan:",
        ...searchStrategies.map((strategy) => `- ${strategy.phrase}`),
        "",
        `Search scope: ${plan.scope}`,
        `Optional keywords: ${plan.keywords || "None"}`,
        "",
        `Return at most ${Math.min(plan.maximumResults, MAX_CANDIDATES)} candidates.`,
      ].join("\n"),
    },
  ];
}

function normalizeAiCandidate(
  candidate: AiDiscoveredCandidate,
  input: OrganizationDiscoveryInput,
): ResourceDiscoveryCandidate | null {
  const organization = cleanString(candidate.organization);
  const website = cleanUrl(candidate.website);
  const reason = cleanString(candidate.reason);

  if (!organization || !website) {
    return null;
  }

  return {
    organization,
    website,
    description: reason,
    services: [],
    countiesServed: [],
    evidence: [],
    evidenceSources: [],
    provider: aiWebDiscoveryProvider.name,
    providerPriority: aiWebDiscoveryProvider.priority,
    discoverySource: website,
    matchedSearchPhrase: input.searchStrategies[0]?.phrase ?? input.plan.searchObjective,
    alreadyInDirectory: false,
    duplicateConfidence: 0,
    nextStep: "Admin Review",
    isPrimarySource: true,
    freshness: "Fresh",
    conflicts: [],
    confidence: "Medium",
    fieldConfidence: {
      organization: "High",
      website: "High",
    },
    missingFields: [],
    whySuggested:
      reason ??
      `This organization appears relevant to ${input.plan.serviceCategory.subcategory}.`,
    researchStatus: ResourceDiscoveryResearchStatus.ReadyForReview,
  };
}

function toOrganizationCandidate(
  candidate: ResourceDiscoveryCandidate,
): OrganizationCandidate {
  return {
    organization: candidate.organization,
    discoverySource: candidate.discoverySource ?? aiWebDiscoveryProvider.name,
    provider: aiWebDiscoveryProvider.name,
    confidence: candidate.confidence,
    matchedSearchPhrase: candidate.matchedSearchPhrase ?? "",
    website: candidate.website,
    alreadyInDirectory: false,
    duplicateConfidence: 0,
  };
}

function cleanString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function cleanUrl(value: unknown): string | undefined {
  const raw = cleanString(value);

  if (!raw) {
    return undefined;
  }

  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    return url.toString();
  } catch {
    return undefined;
  }
}

function extractStructuredDiscoveryOutput(
  data: OpenAIResponsesApiResponse,
): string | object {
  throwIfOpenAiResponseFailed(data);

  const contentParts = data.output?.flatMap((item) => item.content ?? []) ?? [];
  const parsedPart = contentParts.find((content) => content.parsed !== undefined);

  if (parsedPart?.parsed && typeof parsedPart.parsed === "object") {
    return parsedPart.parsed;
  }

  const refusal = contentParts.find((content) => content.refusal)?.refusal;

  if (refusal) {
    throw new Error(`OpenAI refused Resource Discovery output: ${refusal}`);
  }

  const messageOutputText = contentParts
    .filter((content) => content.type === "output_text" && content.text)
    .map((content) => content.text)
    .join("")
    .trim();

  if (messageOutputText) {
    return messageOutputText;
  }

  const anyText = contentParts
    .map((content) => content.text ?? "")
    .join("")
    .trim();

  if (anyText) {
    return anyText;
  }

  if (data.output_text?.trim()) {
    return data.output_text.trim();
  }

  return "";
}

function throwIfOpenAiResponseFailed(data: OpenAIResponsesApiResponse) {
  if (data.error) {
    throw new Error(
      `OpenAI Resource Discovery response error: ${
        data.error.message ?? data.error.code ?? "Unknown error"
      }`,
    );
  }

  const failedOutput = data.output?.find((item) => item.error);

  if (failedOutput?.error) {
    throw new Error(
      `OpenAI Resource Discovery output error: ${
        failedOutput.error.message ?? failedOutput.error.code ?? "Unknown output error"
      }`,
    );
  }

  if (data.status && data.status !== "completed") {
    throw new Error(
      `OpenAI Resource Discovery response status ${data.status}: ${
        data.incomplete_details?.reason ?? "No details provided"
      }`,
    );
  }
}

function logRawOpenAiDiscoveryPayload(data: OpenAIResponsesApiResponse) {
  console.info(
    "Resource Discovery raw OpenAI Responses payload",
    JSON.stringify(data, null, 2),
  );
}

function logEmptyOpenAiDiscoveryOutput(data: OpenAIResponsesApiResponse) {
  console.warn("Resource Discovery OpenAI output was empty", {
    responseId: data.id,
    status: data.status,
    outputTextPresent: Boolean(data.output_text),
    outputItemTypes: data.output?.map((item) => item.type) ?? [],
    contentTypes:
      data.output?.flatMap((item) =>
        (item.content ?? []).map((content) => content.type ?? "unknown"),
      ) ?? [],
    incompleteReason: data.incomplete_details?.reason,
  });
}

const DISCOVERY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    candidates: {
      type: "array",
      maxItems: MAX_CANDIDATES,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          organization: { type: "string" },
          website: { type: "string" },
          reason: { type: "string" },
        },
        required: ["organization", "website", "reason"],
      },
    },
  },
  required: ["candidates"],
} as const;
