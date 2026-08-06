import type { AiRequestUnderstanding } from "@/lib/services/resources/ai/request-understanding/types";
import type { GroundingEvaluationReport } from "@/lib/services/resources/ai/evaluation/grounding/types";
import type { RequestUnderstanding } from "@/lib/services/resources/intelligence/request-understanding/types";

export type UnderstandingConfidenceLevel = "High" | "Medium" | "Low";

export type UnderstandingConfidenceReasonType =
  | "positive"
  | "warning"
  | "negative";

export type UnderstandingConfidenceReason = {
  type: UnderstandingConfidenceReasonType;
  message: string;
};

export type UnderstandingConfidenceReport = {
  score: number;
  level: UnderstandingConfidenceLevel;
  requiresClarification: boolean;
  reasons: UnderstandingConfidenceReason[];
};

export type UnderstandingConfidenceInput = {
  deterministicUnderstanding: RequestUnderstanding;
  aiUnderstanding: AiRequestUnderstanding;
  groundingEvaluation: GroundingEvaluationReport;
};

export type UnderstandingConfidenceRuleResult = {
  points: number;
  reasons: UnderstandingConfidenceReason[];
};
