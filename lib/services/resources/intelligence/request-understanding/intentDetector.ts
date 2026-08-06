import { normalizeQueryText, parseResourceQuery, tokenizeQuery } from "../parser";
import type { HumanNeedId } from "../types";
import type { IntentConfidence } from "./types";

export function detectIntentConfidence(query: string): IntentConfidence[] {
  const parsed = parseResourceQuery(query);
  const weights = new Map<
    HumanNeedId,
    { weight: number; matchedPhrases: Set<string> }
  >();

  for (const match of parsed.matchedIntents) {
    const phraseWeight = getPhraseWeight(match.phrase);
    const current = weights.get(match.intent) ?? {
      weight: 0,
      matchedPhrases: new Set<string>(),
    };

    current.weight += phraseWeight;
    current.matchedPhrases.add(match.phrase);
    weights.set(match.intent, current);
  }

  const maxWeight = Math.max(
    1,
    ...Array.from(weights.values()).map((entry) => entry.weight)
  );

  return Array.from(weights.entries())
    .map(([need, entry]) => ({
      need,
      weight: entry.weight,
      confidence: roundConfidence(entry.weight / maxWeight),
      matchedPhrases: Array.from(entry.matchedPhrases).sort(),
    }))
    .sort((left, right) => {
      if (right.weight !== left.weight) {
        return right.weight - left.weight;
      }

      return left.need.localeCompare(right.need);
    });
}

export function getPrimaryNeed(
  intentConfidence: IntentConfidence[]
): HumanNeedId | null {
  return intentConfidence[0]?.need ?? null;
}

export function getSecondaryNeeds(
  intentConfidence: IntentConfidence[]
): HumanNeedId[] {
  return intentConfidence.slice(1).map((intent) => intent.need);
}

function getPhraseWeight(phrase: string): number {
  const normalizedPhrase = normalizeQueryText(phrase);
  const tokenCount = tokenizeQuery(normalizedPhrase).length;

  return Math.max(1, tokenCount) * 10;
}

function roundConfidence(value: number): number {
  return Math.round(Math.min(1, Math.max(0, value)) * 100) / 100;
}
