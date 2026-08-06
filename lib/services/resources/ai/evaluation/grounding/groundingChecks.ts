import { normalizeQueryText } from "@/lib/services/resources/intelligence/parser";
import type { AiRequestUnderstanding } from "@/lib/services/resources/ai/request-understanding/types";
import type { UnsupportedClaim } from "./types";

export function findUnsupportedAiUnderstandingClaims(
  userMessage: string,
  ai: AiRequestUnderstanding
): UnsupportedClaim[] {
  const normalizedMessage = normalizeQueryText(userMessage);

  return [
    ...findUnsupportedEligibilityClaims(normalizedMessage, ai),
    ...findUnsupportedLocationClaims(normalizedMessage, ai),
  ];
}

function findUnsupportedEligibilityClaims(
  normalizedMessage: string,
  ai: AiRequestUnderstanding
): UnsupportedClaim[] {
  const claims: UnsupportedClaim[] = [];

  if (
    ai.eligibilityClues.tribalAffiliation &&
    !containsPhrase(normalizedMessage, ai.eligibilityClues.tribalAffiliation)
  ) {
    claims.push({
      field: "eligibilityClues.tribalAffiliation",
      value: ai.eligibilityClues.tribalAffiliation,
      reason: "Tribal affiliation was not explicitly stated in the user message.",
    });
  }

  if (
    ai.eligibilityClues.veteran === true &&
    !containsAny(normalizedMessage, ["veteran", "served", "military"])
  ) {
    claims.push({
      field: "eligibilityClues.veteran",
      value: "true",
      reason: "Veteran status was not explicitly stated in the user message.",
    });
  }

  if (
    ai.eligibilityClues.pregnancy === true &&
    !containsAny(normalizedMessage, ["pregnant", "pregnancy", "expecting"])
  ) {
    claims.push({
      field: "eligibilityClues.pregnancy",
      value: "true",
      reason: "Pregnancy was not explicitly stated in the user message.",
    });
  }

  if (
    ai.eligibilityClues.returningCitizen === true &&
    !containsAny(normalizedMessage, [
      "prison",
      "jail",
      "parole",
      "probation",
      "released",
    ])
  ) {
    claims.push({
      field: "eligibilityClues.returningCitizen",
      value: "true",
      reason: "Returning citizen status was not explicitly stated in the user message.",
    });
  }

  return claims;
}

function findUnsupportedLocationClaims(
  normalizedMessage: string,
  ai: AiRequestUnderstanding
): UnsupportedClaim[] {
  return (["city", "county", "state"] as const)
    .map((field) => {
      const value = ai.location[field];

      if (!value || containsPhrase(normalizedMessage, value)) {
        return null;
      }

      return {
        field: `location.${field}`,
        value,
        reason: "Location was not explicitly stated in the user message.",
      } satisfies UnsupportedClaim;
    })
    .filter((claim): claim is UnsupportedClaim => Boolean(claim));
}

function containsAny(normalizedMessage: string, phrases: string[]): boolean {
  return phrases.some((phrase) => containsPhrase(normalizedMessage, phrase));
}

function containsPhrase(normalizedMessage: string, phrase: string): boolean {
  const normalizedPhrase = normalizeQueryText(phrase);

  if (!normalizedPhrase) {
    return false;
  }

  const pattern = new RegExp(`(^|\\s)${escapeRegExp(normalizedPhrase)}(\\s|$)`);
  return pattern.test(normalizedMessage);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
