import type {
  GroundingEvaluationRecommendation,
  GroundingQuality,
  UnsupportedClaim,
} from "./types";

export function getGroundingQuality(
  agreementScore: number,
  unsupportedClaims: UnsupportedClaim[]
): GroundingQuality {
  if (unsupportedClaims.length >= 3) {
    return "unsafe";
  }

  if (unsupportedClaims.length > 0 || agreementScore < 0.7) {
    return "needs_review";
  }

  if (agreementScore < 0.9) {
    return "good";
  }

  return "excellent";
}

export function getGroundingRecommendation(
  quality: GroundingQuality
): GroundingEvaluationRecommendation {
  if (quality === "unsafe") {
    return "Do not use AI understanding for production merge.";
  }

  if (quality === "needs_review") {
    return "AI understanding needs review before production merge.";
  }

  return "AI understanding appears safe to evaluate further.";
}
