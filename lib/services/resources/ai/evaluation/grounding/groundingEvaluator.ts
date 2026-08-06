import type { AiRequestUnderstanding } from "@/lib/services/resources/ai/request-understanding/types";
import type { RequestUnderstanding } from "@/lib/services/resources/intelligence/request-understanding/types";
import {
  averageAgreementScore,
  scoreGeographyAgreement,
  scoreIntentAgreement,
  scoreSituationAgreement,
  scoreUrgencyAgreement,
} from "./agreementScoring";
import { findUnsupportedAiUnderstandingClaims } from "./groundingChecks";
import {
  getGroundingQuality,
  getGroundingRecommendation,
} from "./report";
import type {
  GroundingEvaluationInput,
  GroundingEvaluationReport,
} from "./types";

export function evaluateGrounding({
  userMessage,
  deterministicUnderstanding,
  aiUnderstanding,
}: GroundingEvaluationInput): GroundingEvaluationReport {
  const intentAgreement = scoreIntentAgreement(
    deterministicUnderstanding,
    aiUnderstanding
  );
  const situationAgreement = scoreSituationAgreement(
    deterministicUnderstanding,
    aiUnderstanding
  );
  const geographyAgreement = scoreGeographyAgreement(
    deterministicUnderstanding.location,
    aiUnderstanding.location
  );
  const urgencyAgreement = scoreUrgencyAgreement(
    deterministicUnderstanding,
    aiUnderstanding
  );
  const agreementScore = averageAgreementScore([
    intentAgreement.score,
    situationAgreement.score,
    geographyAgreement.score,
    urgencyAgreement.score,
  ]);
  const unsupportedClaims = findUnsupportedAiUnderstandingClaims(
    userMessage,
    aiUnderstanding
  );
  const groundingQuality = getGroundingQuality(
    agreementScore,
    unsupportedClaims
  );

  return {
    generatedAt: new Date().toISOString(),
    agreementScore,
    groundingQuality,
    unsupportedClaims,
    additionalUsefulContext: getAdditionalUsefulContext(
      deterministicUnderstanding,
      aiUnderstanding
    ),
    missingContext: getMissingContext(
      deterministicUnderstanding,
      aiUnderstanding
    ),
    recommendation: getGroundingRecommendation(groundingQuality),
    intentAgreement,
    situationAgreement,
    geographyAgreement,
    urgencyAgreement,
  };
}

function getAdditionalUsefulContext(
  deterministic: RequestUnderstanding,
  ai: AiRequestUnderstanding
): string[] {
  const deterministicSituations = deterministic.situations.map(
    (situation) => situation.id
  );
  const context: string[] = [];

  for (const situation of ai.situations) {
    if (!deterministicSituations.includes(situation)) {
      context.push(`Situation: ${situation}`);
    }
  }

  for (const need of ai.secondaryNeeds) {
    if (
      need !== deterministic.primaryNeed &&
      !deterministic.secondaryNeeds.includes(need)
    ) {
      context.push(`Need: ${need}`);
    }
  }

  if (ai.eligibilityClues.tribalAffiliation) {
    context.push(
      `Eligibility clue: tribal affiliation ${ai.eligibilityClues.tribalAffiliation}`
    );
  }

  for (const field of ["city", "county", "state"] as const) {
    const value = ai.location[field];

    if (value && deterministic.location[field] !== value) {
      context.push(`Location ${field}: ${value}`);
    }
  }

  return context;
}

function getMissingContext(
  deterministic: RequestUnderstanding,
  ai: AiRequestUnderstanding
): string[] {
  const context: string[] = [];

  if (deterministic.primaryNeed && deterministic.primaryNeed !== ai.primaryNeed) {
    context.push(`Primary need: ${deterministic.primaryNeed}`);
  }

  for (const need of deterministic.secondaryNeeds) {
    if (!ai.secondaryNeeds.includes(need)) {
      context.push(`Need: ${need}`);
    }
  }

  for (const situation of deterministic.situations) {
    if (!ai.situations.includes(situation.id)) {
      context.push(`Situation: ${situation.id}`);
    }
  }

  for (const field of ["city", "county", "state"] as const) {
    const value = deterministic.location[field];

    if (value && ai.location[field] !== value) {
      context.push(`Location ${field}: ${value}`);
    }
  }

  return context;
}
