import type { ResourceSearchResponse } from "@/lib/services/resources/intelligence/searchEngine";

export interface ClarificationOption {
  id: string;
  label: string;
}

export interface ClarificationResponse {
  action: "clarify";
  question: string;
  options: ClarificationOption[];
  reason:
    | "no_detected_needs"
    | "generic_query"
    | "no_matching_resources"
    | "low_match_score";
}

export interface AnswerResponse {
  action: "answer";
}

export type ClarificationDecision = ClarificationResponse | AnswerResponse;

export type ClarificationQuestionId =
  | "generic_help"
  | "housing"
  | "food"
  | "healthcare";

export interface ClarificationQuestion {
  id: ClarificationQuestionId;
  question: string;
  options: ClarificationOption[];
}

export interface ClarificationEngineInput {
  searchResults: ResourceSearchResponse;
}
