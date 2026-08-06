import type {
  UnderstandingConfidenceInput,
  UnderstandingConfidenceRuleResult,
} from "./types";
import { negative, positive, warning } from "./confidenceReasons";

export function scoreAgreementRule({
  groundingEvaluation,
}: UnderstandingConfidenceInput): UnderstandingConfidenceRuleResult {
  const points = groundingEvaluation.agreementScore * 35;

  if (groundingEvaluation.agreementScore >= 0.9) {
    return {
      points,
      reasons: [positive("Deterministic and AI understanding agree.")],
    };
  }

  if (groundingEvaluation.agreementScore >= 0.7) {
    return {
      points,
      reasons: [warning("Deterministic and AI understanding mostly agree.")],
    };
  }

  return {
    points,
    reasons: [negative("Deterministic and AI understanding disagree.")],
  };
}

export function scoreIntentQualityRule({
  deterministicUnderstanding,
  aiUnderstanding,
  groundingEvaluation,
}: UnderstandingConfidenceInput): UnderstandingConfidenceRuleResult {
  const reasons = [];
  let points = 0;

  if (deterministicUnderstanding.primaryNeed || aiUnderstanding.primaryNeed) {
    points += 15;
    reasons.push(positive("Primary need identified."));
  } else {
    reasons.push(negative("No primary need identified."));
  }

  if (groundingEvaluation.intentAgreement.differences.length === 0) {
    points += 7;
    reasons.push(positive("No conflicting intent detected."));
  } else {
    reasons.push(warning("Intent differences need review."));
  }

  if (
    deterministicUnderstanding.secondaryNeeds.length > 0 ||
    aiUnderstanding.secondaryNeeds.length > 0
  ) {
    points += 3;
    reasons.push(positive("Secondary needs identified."));
  }

  return {
    points,
    reasons,
  };
}

export function scoreSituationQualityRule({
  deterministicUnderstanding,
  aiUnderstanding,
  groundingEvaluation,
}: UnderstandingConfidenceInput): UnderstandingConfidenceRuleResult {
  const deterministicSituations = deterministicUnderstanding.situations.map(
    (situation) => situation.id
  );
  const hasSituation =
    deterministicSituations.length > 0 || aiUnderstanding.situations.length > 0;
  const hasDifferences =
    groundingEvaluation.situationAgreement.missingSituations.length > 0 ||
    groundingEvaluation.situationAgreement.additionalSituations.length > 0;

  if (!hasSituation) {
    return {
      points: 4,
      reasons: [warning("No life situation detected.")],
    };
  }

  if (hasDifferences) {
    return {
      points: 6,
      reasons: [warning("Situation detection differs between systems.")],
    };
  }

  return {
    points: 10,
    reasons: [positive("Situation detected consistently.")],
  };
}

export function scoreGeographyRule({
  deterministicUnderstanding,
  aiUnderstanding,
  groundingEvaluation,
}: UnderstandingConfidenceInput): UnderstandingConfidenceRuleResult {
  const geographyWasDetected =
    hasLocation(deterministicUnderstanding.location) ||
    hasLocation(aiUnderstanding.location);

  if (!geographyWasDetected) {
    return {
      points: 5,
      reasons: [warning("No location identified.")],
    };
  }

  if (groundingEvaluation.geographyAgreement.score === 1) {
    return {
      points: 10,
      reasons: [positive("Location identified.")],
    };
  }

  return {
    points: 4,
    reasons: [warning("Location differs between systems.")],
  };
}

export function scoreUrgencyRule({
  deterministicUnderstanding,
  aiUnderstanding,
  groundingEvaluation,
}: UnderstandingConfidenceInput): UnderstandingConfidenceRuleResult {
  const urgencyIsClear =
    deterministicUnderstanding.urgency.level !== "low" ||
    aiUnderstanding.urgency !== "low";

  if (groundingEvaluation.urgencyAgreement.score === 1 && urgencyIsClear) {
    return {
      points: 10,
      reasons: [positive("Urgency identified consistently.")],
    };
  }

  if (groundingEvaluation.urgencyAgreement.score === 1) {
    return {
      points: 6,
      reasons: [warning("Urgency appears low or not explicit.")],
    };
  }

  return {
    points: 3,
    reasons: [warning("Urgency differs between systems.")],
  };
}

export function scoreEligibilityRule({
  aiUnderstanding,
  groundingEvaluation,
}: UnderstandingConfidenceInput): UnderstandingConfidenceRuleResult {
  const hasEligibilityClue =
    Boolean(aiUnderstanding.eligibilityClues.tribalAffiliation) ||
    aiUnderstanding.eligibilityClues.veteran === true ||
    aiUnderstanding.eligibilityClues.pregnancy === true ||
    aiUnderstanding.eligibilityClues.returningCitizen === true;
  const hasUnsupportedEligibility =
    groundingEvaluation.unsupportedClaims.some((claim) =>
      claim.field.startsWith("eligibilityClues.")
    );

  if (hasUnsupportedEligibility) {
    return {
      points: 0,
      reasons: [negative("Eligibility clue appears unsupported.")],
    };
  }

  if (!hasEligibilityClue) {
    return {
      points: 3,
      reasons: [warning("No explicit eligibility clues identified.")],
    };
  }

  return {
    points: 5,
    reasons: [positive("Explicit eligibility clues identified.")],
  };
}

export function scoreGroundingQualityRule({
  groundingEvaluation,
}: UnderstandingConfidenceInput): UnderstandingConfidenceRuleResult {
  if (groundingEvaluation.groundingQuality === "excellent") {
    return {
      points: 5,
      reasons: [positive("Grounding quality excellent.")],
    };
  }

  if (groundingEvaluation.groundingQuality === "good") {
    return {
      points: 4,
      reasons: [positive("Grounding quality good.")],
    };
  }

  if (groundingEvaluation.groundingQuality === "needs_review") {
    return {
      points: 2,
      reasons: [warning("Grounding quality needs review.")],
    };
  }

  return {
    points: 0,
    reasons: [negative("Grounding quality is unsafe.")],
  };
}

function hasLocation(location: { city?: string; county?: string; state?: string }) {
  return Boolean(location.city || location.county || location.state);
}
