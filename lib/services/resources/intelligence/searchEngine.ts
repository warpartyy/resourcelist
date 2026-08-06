import { RESOURCE_INTENTS } from "./intents";
import { normalizeQueryText, parseResourceQuery, tokenizeQuery } from "./parser";
import {
  buildQueryTerms,
  getResourceFieldValues,
  RESOURCE_FIELD_WEIGHTS,
  scoreResourceFieldValue,
} from "./ranking";
import { INTENT_SYNONYMS } from "./synonyms";
import type { HumanNeedId, ResourceRow, ResourceSearchField } from "./types";

export const SEARCH_CONFIDENCE_THRESHOLDS = {
  high: 80,
  medium: 60,
  minimumScore: 1,
} as const;

export const SEARCH_FIELD_WEIGHTS = RESOURCE_FIELD_WEIGHTS;

export type SearchConfidence = "high" | "medium" | "low";

export type ResourceSearchReason = {
  field: ResourceSearchField;
  matchedValue: string;
  points: number;
};

export type ResourceSearchResult = {
  resource: ResourceRow;
  score: number;
  confidence: SearchConfidence;
  reasons: ResourceSearchReason[];
};

export type ResourceSearchResponse = {
  normalizedQuery: string;
  detectedNeeds: HumanNeedId[];
  expandedTerms: string[];
  results: ResourceSearchResult[];
};

export type SearchResourcesInput = {
  query: string;
  resources: ResourceRow[];
};

const SEARCHABLE_FIELDS = Object.keys(SEARCH_FIELD_WEIGHTS) as ResourceSearchField[];
const KEYWORD_SEARCH_FIELDS = SEARCHABLE_FIELDS;
const INTENT_SEARCH_FIELDS = SEARCHABLE_FIELDS.filter(
  (field) => field !== "organization" && field !== "city"
);
const CONFIDENCE_COVERAGE_STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "can",
  "for",
  "from",
  "help",
  "i",
  "me",
  "my",
  "need",
  "the",
  "to",
  "with",
]);

export function searchResources({
  query,
  resources,
}: SearchResourcesInput): ResourceSearchResponse {
  const parsedQuery = parseResourceQuery(query);
  const detectedNeeds = getDetectedNeeds(parsedQuery.matchedIntents.map((match) => match.intent));
  const expandedTerms = buildQueryTerms(parsedQuery);

  if (!parsedQuery.normalized || resources.length === 0) {
    return {
      normalizedQuery: parsedQuery.normalized,
      detectedNeeds,
      expandedTerms,
      results: [],
    };
  }

  const results: ResourceSearchResult[] = [];

  for (const resource of resources) {
    const { score, reasons } = scoreResourceWithReasons(
      parsedQuery,
      expandedTerms,
      resource,
      parsedQuery.matchedIntents.length
    );

    if (score < SEARCH_CONFIDENCE_THRESHOLDS.minimumScore) {
      continue;
    }

    results.push({
      resource,
      score,
      confidence: getConfidence(
        score,
        parsedQuery.tokens,
        parsedQuery.matchedIntents.length,
        reasons
      ),
      reasons,
    });
  }

  results.sort((left, right) => right.score - left.score);

  return {
    normalizedQuery: parsedQuery.normalized,
    detectedNeeds,
    expandedTerms,
    results,
  };
}

function getDetectedNeeds(needs: HumanNeedId[]): HumanNeedId[] {
  return Array.from(new Set(needs));
}

function getConfidence(
  score: number,
  queryTokens: string[],
  intentMatchCount: number,
  reasons: ResourceSearchReason[]
): SearchConfidence {
  const matchedTokens = getMatchedQueryTokens(queryTokens, reasons);
  const meaningfulTokens = queryTokens.filter(
    (token) => !CONFIDENCE_COVERAGE_STOPWORDS.has(token)
  );
  const hasFullTokenCoverage =
    intentMatchCount > 0 ||
    meaningfulTokens.length <= 1 ||
    meaningfulTokens.every((token) => matchedTokens.includes(token));

  if (!hasFullTokenCoverage) {
    return "low";
  }

  if (score >= SEARCH_CONFIDENCE_THRESHOLDS.high) {
    return "high";
  }

  if (score >= SEARCH_CONFIDENCE_THRESHOLDS.medium) {
    return "medium";
  }

  return "low";
}

function getMatchedQueryTokens(
  queryTokens: string[],
  reasons: ResourceSearchReason[]
): string[] {
  const matchedTokens = new Set<string>();

  for (const reason of reasons) {
    const normalizedValue = normalizeQueryText(reason.matchedValue);
    const valueTokens = new Set(tokenizeQuery(normalizedValue));

    for (const token of queryTokens) {
      if (valueTokens.has(token) || normalizedValue.includes(token)) {
        matchedTokens.add(token);
      }
    }
  }

  return Array.from(matchedTokens);
}

function scoreResourceWithReasons(
  parsedQuery: ReturnType<typeof parseResourceQuery>,
  expandedTerms: string[],
  resource: ResourceRow,
  intentMatchCount: number
): { score: number; reasons: ResourceSearchReason[] } {
  const reasons: ResourceSearchReason[] = [];
  let score = 0;
  const searchableFields =
    intentMatchCount > 0 ? INTENT_SEARCH_FIELDS : KEYWORD_SEARCH_FIELDS;

  for (const field of searchableFields) {
    const fieldWeight = SEARCH_FIELD_WEIGHTS[field];

    for (const value of getResourceFieldValues(resource, field)) {
      const points = scoreResourceFieldValue(parsedQuery, expandedTerms, value) * fieldWeight;

      if (points > 0) {
        score += points;
        reasons.push({
          field,
          matchedValue: value,
          points,
        });
      }
    }
  }

  return { score, reasons };
}

export function getAvailableSearchNeeds(): HumanNeedId[] {
  return RESOURCE_INTENTS.map((intent) => intent.id);
}

export function getSearchSynonymPhrases(): string[] {
  return Object.keys(INTENT_SYNONYMS);
}
