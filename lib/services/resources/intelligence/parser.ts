import { INTENT_SYNONYMS } from "./synonyms";
import type { IntentMatch, NormalizedQuery } from "./types";

const PUNCTUATION_PATTERN = /[^\p{L}\p{N}\s]/gu;
const WHITESPACE_PATTERN = /\s+/g;

export function normalizeQueryText(input: string): string {
  return input
    .toLowerCase()
    .replace(PUNCTUATION_PATTERN, " ")
    .replace(WHITESPACE_PATTERN, " ")
    .trim();
}

export function tokenizeQuery(input: string): string[] {
  const normalized = normalizeQueryText(input);

  if (!normalized) {
    return [];
  }

  return Array.from(new Set(normalized.split(" ")));
}

export function extractIntentMatches(normalizedText: string): IntentMatch[] {
  const matches: IntentMatch[] = [];

  for (const [phrase, intents] of Object.entries(INTENT_SYNONYMS)) {
    const normalizedPhrase = normalizeQueryText(phrase);
    const phrasePattern = new RegExp(`(^|\\s)${escapeRegExp(normalizedPhrase)}(\\s|$)`);

    if (!phrasePattern.test(normalizedText)) {
      continue;
    }

    for (const intent of intents) {
      matches.push({ intent, phrase });
    }
  }

  return matches;
}

export function parseResourceQuery(input: string): NormalizedQuery {
  const normalized = normalizeQueryText(input);

  return {
    raw: input,
    normalized,
    tokens: tokenizeQuery(normalized),
    matchedIntents: extractIntentMatches(normalized),
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
