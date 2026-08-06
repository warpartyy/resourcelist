import type { RequestUnderstanding } from "@/lib/services/resources/intelligence/request-understanding/types";
import type { AiRequestUnderstanding } from "@/lib/services/resources/ai/request-understanding/types";

export type AgreementDifference = {
  field: string;
  deterministicValue: string | string[] | null;
  aiValue: string | string[] | null;
};

export type SituationAgreement = {
  score: number;
  missingSituations: string[];
  additionalSituations: string[];
};

export type IntentAgreement = {
  score: number;
  differences: AgreementDifference[];
};

export type GeographyAgreement = {
  score: number;
  differences: AgreementDifference[];
};

export type UrgencyAgreement = {
  score: number;
  deterministicUrgency: string;
  aiUrgency: string;
};

export type UnsupportedClaim = {
  field: string;
  value: string;
  reason: string;
};

export type GroundingQuality = "excellent" | "good" | "needs_review" | "unsafe";

export type GroundingEvaluationRecommendation =
  | "AI understanding appears safe to evaluate further."
  | "AI understanding needs review before production merge."
  | "Do not use AI understanding for production merge.";

export type GroundingEvaluationReport = {
  generatedAt: string;
  agreementScore: number;
  groundingQuality: GroundingQuality;
  unsupportedClaims: UnsupportedClaim[];
  additionalUsefulContext: string[];
  missingContext: string[];
  recommendation: GroundingEvaluationRecommendation;
  intentAgreement: IntentAgreement;
  situationAgreement: SituationAgreement;
  geographyAgreement: GeographyAgreement;
  urgencyAgreement: UrgencyAgreement;
};

export type GroundingEvaluationInput = {
  userMessage: string;
  deterministicUnderstanding: RequestUnderstanding;
  aiUnderstanding: AiRequestUnderstanding;
};
