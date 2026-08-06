import { CLARIFICATION_QUESTIONS } from "./questions";
import type {
  ClarificationDecision,
  ClarificationEngineInput,
  ClarificationQuestion,
} from "./types";

const GENERIC_PHRASES = [
  "help",
  "need help",
  "resources",
  "assistance",
  "support",
  "i don't know",
  "where do i start",
  "can someone help me",
  "i need help",
  "i need resources",
  "i dont know where to start",
  "i don t know where to start",
  "i do not know where to start",
  "help me",
  "someone help me",
] as const;

const GENERIC_QUERIES = new Set(GENERIC_PHRASES.map(normalizeForComparison));
const MINIMUM_MEANINGFUL_TOP_SCORE = 1;

export function determineClarification({
  searchResults,
}: ClarificationEngineInput): ClarificationDecision {
  const question = getQuestionForSearchResults(searchResults);
  const topScore = searchResults.results[0]?.score ?? 0;

  if (isGenericQuery(searchResults.normalizedQuery)) {
    return buildClarification(question, "generic_query");
  }

  if (searchResults.detectedNeeds.length === 0) {
    return buildClarification(question, "no_detected_needs");
  }

  if (searchResults.results.length === 0) {
    return buildClarification(question, "no_matching_resources");
  }

  if (topScore < MINIMUM_MEANINGFUL_TOP_SCORE) {
    return buildClarification(question, "low_match_score");
  }

  return { action: "answer" };
}

export function calculateConfidenceRatio(searchResults: {
  results: Array<{ confidence: string }>;
}): number {
  if (searchResults.results.length === 0) {
    return 0;
  }

  return countHighConfidenceResults(searchResults) / searchResults.results.length;
}

function countHighConfidenceResults(searchResults: {
  results: Array<{ confidence: string }>;
}): number {
  return searchResults.results.filter((result) => result.confidence === "high").length;
}

function getQuestionForSearchResults(
  searchResults: ClarificationEngineInput["searchResults"]
): ClarificationQuestion {
  if (searchResults.detectedNeeds.includes("housing")) {
    return CLARIFICATION_QUESTIONS.housing;
  }

  if (searchResults.detectedNeeds.includes("food")) {
    return CLARIFICATION_QUESTIONS.food;
  }

  if (
    searchResults.detectedNeeds.includes("healthcare") ||
    searchResults.detectedNeeds.includes("mental_health") ||
    searchResults.detectedNeeds.includes("substance_use")
  ) {
    return CLARIFICATION_QUESTIONS.healthcare;
  }

  return CLARIFICATION_QUESTIONS.generic_help;
}

function buildClarification(
  question: ClarificationQuestion,
  reason: Exclude<ClarificationDecision, { action: "answer" }>["reason"]
): ClarificationDecision {
  return {
    action: "clarify",
    question: question.question,
    options: question.options,
    reason,
  };
}

function isGenericQuery(normalizedQuery: string): boolean {
  return GENERIC_QUERIES.has(normalizeForComparison(normalizedQuery));
}

function normalizeForComparison(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
