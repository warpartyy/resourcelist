import type { HumanNeedId, ResourceRow } from "../types";

export type IntentConfidence = {
  need: HumanNeedId;
  confidence: number;
  weight: number;
  matchedPhrases: string[];
};

export type DetectedLocation = {
  city?: string;
  county?: string;
  state?: string;
  matchedTerms: string[];
};

export type RequestUrgencyLevel = "low" | "medium" | "high" | "crisis";

export type RequestUrgency = {
  level: RequestUrgencyLevel;
  score: number;
  matchedTerms: string[];
};

export type SituationDetection = {
  id: string;
  label: string;
  confidence: number;
  matchedTerms: string[];
  derivedNeeds: string[];
};

export type RequestUnderstanding = {
  normalizedQuery: string;
  primaryNeed: HumanNeedId | null;
  secondaryNeeds: HumanNeedId[];
  intentConfidence: IntentConfidence[];
  location: DetectedLocation;
  urgency: RequestUrgency;
  situations: SituationDetection[];
  derivedNeeds: string[];
  situationConfidence: number;
  matchedSituationTerms: string[];
};

export type RequestUnderstandingInput = {
  query: string;
  resources?: ResourceRow[];
};
