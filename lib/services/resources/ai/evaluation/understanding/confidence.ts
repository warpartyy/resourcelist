import {
  scoreAgreementRule,
  scoreEligibilityRule,
  scoreGeographyRule,
  scoreGroundingQualityRule,
  scoreIntentQualityRule,
  scoreSituationQualityRule,
  scoreUrgencyRule,
} from "./confidenceRules";
import { buildUnderstandingConfidenceReport } from "./report";
import type {
  UnderstandingConfidenceInput,
  UnderstandingConfidenceReport,
  UnderstandingConfidenceRuleResult,
} from "./types";

const CONFIDENCE_RULES = [
  scoreAgreementRule,
  scoreIntentQualityRule,
  scoreSituationQualityRule,
  scoreGeographyRule,
  scoreUrgencyRule,
  scoreEligibilityRule,
  scoreGroundingQualityRule,
] as const;

export function evaluateUnderstandingConfidence(
  input: UnderstandingConfidenceInput
): UnderstandingConfidenceReport {
  const ruleResults: UnderstandingConfidenceRuleResult[] = CONFIDENCE_RULES.map(
    (rule) => rule(input)
  );
  const score = ruleResults.reduce((sum, result) => sum + result.points, 0);
  const reasons = ruleResults.flatMap((result) => result.reasons);

  return buildUnderstandingConfidenceReport(score, reasons);
}
