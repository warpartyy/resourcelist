import type { ResourceGuideEvaluation } from "@/lib/services/resources/ai/evaluation/types";
import type { ClarificationOption } from "@/lib/services/resources/ai/clarification/types";
import type { ValidationResult } from "@/lib/services/resources/ai/validation/types";
import type { Database } from "@/lib/database.types";
import type { GroundedResourceSelectionTier } from "@/lib/services/resources/ai/grounding";

export type ResourceRow = Database["public"]["Tables"]["resources"]["Row"];

export type ResourceSearchToolInput = {
  message?: string;
  conversationId?: string;
  promptVersion?: string;
};

export interface EligibilityExplainerInput {
  resource: ResourceRow;
  question: string;
}

export type ToolExecutionInput =
  | ResourceSearchToolInput
  | EligibilityExplainerInput;

export type GroundedResourceResult = {
  score: number;
  confidence: "high" | "medium" | "low";
  isFallbackMatch?: boolean;
  selectionTier?: GroundedResourceSelectionTier;
  reasons: Array<{
    field: string;
    matchedValue: string;
    points: number;
  }>;
  resource: {
    id: string;
    organization: string | null;
    description: string | null;
    services: string[] | null;
    parent_categories?: string[] | null;
    subcategories?: string[] | null;
    eligibility: string | null;
    tribal_eligibility: string | null;
    counties_served: string[] | null;
    website: string | null;
    phone: string | null;
    application_link: string | null;
    last_verified?: string | null;
  };
};

export type SearchMetadataResult = {
  normalizedQuery: string;
  detectedNeeds: string[];
  expandedTerms: string[];
  results: Array<{
    resourceId: string;
    score: number;
    confidence: string;
    reasons: Array<{
      field: string;
      matchedValue: string;
      points: number;
    }>;
  }>;
};

export type ResourceSearchToolResult =
  | {
      type: "clarification";
      conversationId: string;
      question: string;
      options: ClarificationOption[];
    }
  | {
      type: "answer";
      conversationId: string;
      response: string;
      metadata: unknown;
      searchMetadata: SearchMetadataResult;
      groundedResults: GroundedResourceResult[];
      evaluation?: ResourceGuideEvaluation;
      validation?: ValidationResult;
    };

export type EligibilityExplainerToolResult = {
  type: "eligibility_explanation";
  response: string;
  validation: ValidationResult;
};

export type ToolExecutionResult =
  | ResourceSearchToolResult
  | EligibilityExplainerToolResult;

export interface ResourceGuideTool {
  id: string;
  name: string;
  execute(input: ToolExecutionInput): Promise<ToolExecutionResult>;
}
