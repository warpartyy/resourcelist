import type {
  DetectedLocation,
  RequestUnderstanding,
} from "@/lib/services/resources/intelligence/request-understanding/types";
import type { AiRequestUnderstanding } from "@/lib/services/resources/ai/request-understanding/types";
import type {
  AgreementDifference,
  GeographyAgreement,
  IntentAgreement,
  SituationAgreement,
  UrgencyAgreement,
} from "./types";

export function scoreIntentAgreement(
  deterministic: RequestUnderstanding,
  ai: AiRequestUnderstanding
): IntentAgreement {
  const differences: AgreementDifference[] = [];
  let score = 1;

  if (deterministic.primaryNeed !== ai.primaryNeed) {
    score -= 0.45;
    differences.push({
      field: "primaryNeed",
      deterministicValue: deterministic.primaryNeed,
      aiValue: ai.primaryNeed,
    });
  }

  const secondaryScore = scoreSetAgreement(
    deterministic.secondaryNeeds,
    ai.secondaryNeeds
  );

  if (secondaryScore < 1) {
    differences.push({
      field: "secondaryNeeds",
      deterministicValue: deterministic.secondaryNeeds,
      aiValue: ai.secondaryNeeds,
    });
  }

  score -= (1 - secondaryScore) * 0.35;

  return {
    score: roundScore(score),
    differences,
  };
}

export function scoreSituationAgreement(
  deterministic: RequestUnderstanding,
  ai: AiRequestUnderstanding
): SituationAgreement {
  const deterministicSituations = deterministic.situations.map(
    (situation) => situation.id
  );
  const missingSituations = deterministicSituations.filter(
    (situation) => !ai.situations.includes(situation)
  );
  const additionalSituations = ai.situations.filter(
    (situation) => !deterministicSituations.includes(situation)
  );
  const score = scoreSetAgreement(deterministicSituations, ai.situations);

  return {
    score,
    missingSituations,
    additionalSituations,
  };
}

export function scoreGeographyAgreement(
  deterministic: DetectedLocation,
  ai: DetectedLocation
): GeographyAgreement {
  const fields = ["city", "county", "state"] as const;
  const differences: AgreementDifference[] = [];
  let matchingFields = 0;

  for (const field of fields) {
    const deterministicValue = deterministic[field] ?? null;
    const aiValue = ai[field] ?? null;

    if (deterministicValue === aiValue) {
      matchingFields += 1;
      continue;
    }

    if (!deterministicValue && !aiValue) {
      matchingFields += 1;
      continue;
    }

    differences.push({
      field: `location.${field}`,
      deterministicValue,
      aiValue,
    });
  }

  return {
    score: roundScore(matchingFields / fields.length),
    differences,
  };
}

export function scoreUrgencyAgreement(
  deterministic: RequestUnderstanding,
  ai: AiRequestUnderstanding
): UrgencyAgreement {
  return {
    score: deterministic.urgency.level === ai.urgency ? 1 : 0,
    deterministicUrgency: deterministic.urgency.level,
    aiUrgency: ai.urgency,
  };
}

export function averageAgreementScore(scores: number[]): number {
  if (scores.length === 0) {
    return 0;
  }

  return roundScore(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

function scoreSetAgreement(left: string[], right: string[]): number {
  const leftSet = new Set(left);
  const rightSet = new Set(right);

  if (leftSet.size === 0 && rightSet.size === 0) {
    return 1;
  }

  const union = new Set([...leftSet, ...rightSet]);
  const intersection = Array.from(leftSet).filter((value) => rightSet.has(value));

  return roundScore(intersection.length / union.size);
}

function roundScore(score: number): number {
  return Math.round(Math.min(1, Math.max(0, score)) * 100) / 100;
}
