import { normalizeQueryText } from "../parser";
import type { RequestUrgency } from "./types";

const URGENCY_SIGNALS = [
  { phrase: "right now", points: 35 },
  { phrase: "as soon as possible", points: 35 },
  { phrase: "asap", points: 35 },
  { phrase: "immediately", points: 35 },
  { phrase: "urgent", points: 30 },
  { phrase: "emergency", points: 30 },
  { phrase: "crisis", points: 30 },
  { phrase: "tonight", points: 25 },
  { phrase: "today", points: 20 },
  { phrase: "now", points: 20 },
  { phrase: "eviction", points: 20 },
  { phrase: "shut off", points: 20 },
  { phrase: "sleeping in my car", points: 30 },
  { phrase: "homeless", points: 25 },
  { phrase: "unsafe", points: 25 },
] as const;

export function detectUrgency(query: string): RequestUrgency {
  const normalizedQuery = normalizeQueryText(query);
  const matchedSignals = URGENCY_SIGNALS.filter((signal) =>
    containsNormalizedPhrase(normalizedQuery, signal.phrase)
  );
  const score = matchedSignals.reduce((sum, signal) => sum + signal.points, 0);

  return {
    level: getUrgencyLevel(score),
    score,
    matchedTerms: matchedSignals.map((signal) => signal.phrase),
  };
}

function getUrgencyLevel(score: number): RequestUrgency["level"] {
  if (score >= 60) {
    return "crisis";
  }

  if (score >= 35) {
    return "high";
  }

  if (score >= 20) {
    return "medium";
  }

  return "low";
}

function containsNormalizedPhrase(
  normalizedQuery: string,
  phrase: string
): boolean {
  const normalizedPhrase = normalizeQueryText(phrase);
  const pattern = new RegExp(`(^|\\s)${escapeRegExp(normalizedPhrase)}(\\s|$)`);

  return pattern.test(normalizedQuery);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
