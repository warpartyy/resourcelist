import type { HumanNeedId } from "@/lib/services/resources/intelligence/types";
import type {
  DetectedLocation,
  RequestUnderstanding,
  RequestUrgencyLevel,
} from "@/lib/services/resources/intelligence/request-understanding/types";

export type AiEligibilityClues = {
  tribalAffiliation?: string;
  veteran?: boolean;
  pregnancy?: boolean;
  returningCitizen?: boolean;
};

export type AiRequestUnderstanding = {
  primaryNeed: HumanNeedId | null;
  secondaryNeeds: HumanNeedId[];
  situations: string[];
  urgency: RequestUrgencyLevel;
  eligibilityClues: AiEligibilityClues;
  location: DetectedLocation;
  confidence: number;
};

export type ExtractAiRequestUnderstandingInput = {
  message: string;
};

export type MergeRequestUnderstandingInput = {
  deterministic: RequestUnderstanding;
  ai: AiRequestUnderstanding;
};

export type MergedRequestUnderstanding = RequestUnderstanding & {
  aiUnderstanding: AiRequestUnderstanding;
  mergeNotes: Array<{
    field: string;
    source: "deterministic" | "ai";
    reason: string;
  }>;
};
