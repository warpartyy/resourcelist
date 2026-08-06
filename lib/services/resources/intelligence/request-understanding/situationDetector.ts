import { normalizeQueryText, tokenizeQuery } from "../parser";
import { SITUATION_DEFINITIONS } from "./situationDefinitions";
import type { SituationDetection } from "./types";

export function detectSituations(query: string): SituationDetection[] {
  const normalizedQuery = normalizeQueryText(query);
  const detections = SITUATION_DEFINITIONS.map((definition) => {
    const matchedTerms = definition.phrases.filter((phrase) =>
      containsNormalizedPhrase(normalizedQuery, phrase)
    );

    if (matchedTerms.length === 0) {
      return null;
    }

    const weight = matchedTerms.reduce(
      (sum, phrase) => sum + getPhraseWeight(phrase),
      0
    );

    return {
      id: definition.id,
      label: definition.label,
      confidence: getSituationConfidence(weight),
      matchedTerms,
      derivedNeeds: definition.derivedNeeds,
    };
  }).filter((detection): detection is SituationDetection => Boolean(detection));

  return detections.sort((left, right) => {
    if (right.confidence !== left.confidence) {
      return right.confidence - left.confidence;
    }

    return left.label.localeCompare(right.label);
  });
}

export function getDerivedNeeds(situations: SituationDetection[]): string[] {
  return getUniqueValues(situations.flatMap((situation) => situation.derivedNeeds));
}

export function getMatchedSituationTerms(
  situations: SituationDetection[]
): string[] {
  return getUniqueValues(situations.flatMap((situation) => situation.matchedTerms));
}

export function getSituationConfidence(
  weightOrSituations: number | SituationDetection[]
): number {
  if (Array.isArray(weightOrSituations)) {
    return weightOrSituations[0]?.confidence ?? 0;
  }

  const confidence = Math.min(0.95, 0.45 + weightOrSituations / 100);
  return Math.round(confidence * 100) / 100;
}

function getPhraseWeight(phrase: string): number {
  return Math.max(1, tokenizeQuery(phrase).length) * 12;
}

function containsNormalizedPhrase(
  normalizedQuery: string,
  phrase: string
): boolean {
  const normalizedPhrase = normalizeQueryText(phrase);
  const pattern = new RegExp(`(^|\\s)${escapeRegExp(normalizedPhrase)}(\\s|$)`);

  return pattern.test(normalizedQuery);
}

function getUniqueValues(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
