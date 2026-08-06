import { RESOURCE_INTENTS } from "./intents";
import { normalizeQueryText, parseResourceQuery, tokenizeQuery } from "./parser";
import {
  buildQueryTerms,
  getResourceIntentRelevanceMatches,
  getResourceFieldValues,
  INTENT_RELEVANCE_BOOST,
  RESOURCE_FIELD_WEIGHTS,
  scoreResourceFieldValue,
} from "./ranking";
import { INTENT_SYNONYMS } from "./synonyms";
import type { HumanNeedId, ResourceRow, ResourceSearchField } from "./types";
import { understandResourceRequest } from "./request-understanding/requestUnderstanding";
import type { RequestUnderstanding } from "./request-understanding/types";

export const SEARCH_CONFIDENCE_THRESHOLDS = {
  high: 80,
  medium: 60,
  minimumScore: 1,
} as const;

export const SEARCH_FIELD_WEIGHTS = RESOURCE_FIELD_WEIGHTS;

export type SearchConfidence = "high" | "medium" | "low";

export type ResourceSearchReason = {
  field: ResourceSearchField | "intent_relevance";
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
  requestUnderstanding: RequestUnderstanding;
  candidateSelection: ResourceCandidateSelection;
  results: ResourceSearchResult[];
};

export type ResourceCandidateSelection = {
  detectedIntents: HumanNeedId[];
  candidateResourceCount: number;
  rankedResourceCount: number;
  candidateFilter: string;
  expandedSearch: boolean;
  recommendationMode:
    | "unfiltered"
    | "intent_candidates"
    | "fallback_recommendation";
  reason?: string;
};

export type SearchResourcesInput = {
  query: string;
  resources: ResourceRow[];
};

const SEARCHABLE_FIELDS = Object.keys(SEARCH_FIELD_WEIGHTS) as ResourceSearchField[];
const KEYWORD_SEARCH_FIELDS = SEARCHABLE_FIELDS;
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
const EXACT_FIELD_MATCH_BONUSES: Partial<Record<ResourceSearchField, number>> = {
  city: 30,
  organization: 25,
  services: 20,
  subcategories: 15,
};
const MIN_INTENT_CANDIDATE_RESOURCES = 3;

export function searchResources({
  query,
  resources,
}: SearchResourcesInput): ResourceSearchResponse {
  const requestUnderstanding = understandResourceRequest({ query, resources });
  const parsedQuery = parseResourceQuery(query);
  const detectedNeeds = getDetectedNeeds(parsedQuery.matchedIntents.map((match) => match.intent));
  const expandedTerms = buildQueryTerms(parsedQuery);
  const candidateSelection = buildCandidateResourceSet(resources, detectedNeeds);

  if (!parsedQuery.normalized || resources.length === 0) {
    return {
      normalizedQuery: parsedQuery.normalized,
      detectedNeeds,
      expandedTerms,
      requestUnderstanding,
      candidateSelection: candidateSelection.metadata,
      results: [],
    };
  }

  const results: ResourceSearchResult[] = [];

  for (const resource of candidateSelection.resources) {
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
    requestUnderstanding,
    candidateSelection: candidateSelection.metadata,
    results,
  };
}

function getDetectedNeeds(needs: HumanNeedId[]): HumanNeedId[] {
  return Array.from(new Set(needs));
}

function buildCandidateResourceSet(
  resources: ResourceRow[],
  detectedNeeds: HumanNeedId[]
): { resources: ResourceRow[]; metadata: ResourceCandidateSelection } {
  if (detectedNeeds.length === 0) {
    return {
      resources,
      metadata: {
        detectedIntents: detectedNeeds,
        candidateResourceCount: resources.length,
        rankedResourceCount: resources.length,
        candidateFilter: "No intent filter",
        expandedSearch: false,
        recommendationMode: "unfiltered",
      },
    };
  }

  const candidateResources = resources.filter(
    (resource) =>
      getResourceIntentRelevanceMatches(detectedNeeds, resource).length > 0
  );
  const candidateFilter = `${detectedNeeds
    .map(formatIntentLabel)
    .join(", ")} metadata`;

  if (candidateResources.length < MIN_INTENT_CANDIDATE_RESOURCES) {
    return {
      resources,
      metadata: {
        detectedIntents: detectedNeeds,
        candidateResourceCount: candidateResources.length,
        rankedResourceCount: resources.length,
        candidateFilter,
        expandedSearch: true,
        recommendationMode: "fallback_recommendation",
        reason: `Fewer than three ${detectedNeeds
          .map(formatIntentLabel)
          .join(" or ")} resources available.`,
      },
    };
  }

  return {
    resources: candidateResources,
    metadata: {
      detectedIntents: detectedNeeds,
      candidateResourceCount: candidateResources.length,
      rankedResourceCount: candidateResources.length,
      candidateFilter,
      expandedSearch: false,
      recommendationMode: "intent_candidates",
    },
  };
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
  const searchableFields = KEYWORD_SEARCH_FIELDS;
  const detectedNeeds =
    intentMatchCount > 0
      ? getDetectedNeeds(parsedQuery.matchedIntents.map((match) => match.intent))
      : [];
  const intentMatches =
    intentMatchCount > 0
      ? getResourceIntentRelevanceMatches(detectedNeeds, resource)
      : [];
  const hasIntentAlignment = intentMatches.length > 0;

  for (const field of searchableFields) {
    const fieldWeight = SEARCH_FIELD_WEIGHTS[field];

    for (const value of getResourceFieldValues(resource, field)) {
      if (
        intentMatchCount > 0 &&
        !hasIntentAlignment &&
        isLocationOnlyIntentMismatch(parsedQuery, field, value)
      ) {
        continue;
      }

      const scoringTerms = getScoringTermsForField(
        parsedQuery,
        expandedTerms,
        field
      );
      const points =
        scoreResourceFieldValue(parsedQuery, scoringTerms, value) * fieldWeight +
        getExactFieldMatchBonus(parsedQuery, field, value, hasIntentAlignment);

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

  if (intentMatches.length > 0) {
    const intentScore = intentMatches.length * INTENT_RELEVANCE_BOOST;

    score += intentScore;
    reasons.push(
      ...intentMatches.map((intent) => ({
        field: "intent_relevance" as const,
        matchedValue: `Resource metadata aligns with detected ${formatIntentLabel(intent)} intent.`,
        points: INTENT_RELEVANCE_BOOST,
      }))
    );
  }

  return { score, reasons };
}

function getScoringTermsForField(
  parsedQuery: ReturnType<typeof parseResourceQuery>,
  expandedTerms: string[],
  field: ResourceSearchField
): string[] {
  if (field !== "organization" || parsedQuery.matchedIntents.length === 0) {
    return expandedTerms;
  }

  return Array.from(
    new Set(
      parsedQuery.matchedIntents
        .flatMap((match) => [match.phrase, match.intent])
        .map(normalizeQueryText)
        .filter(Boolean)
    )
  );
}

function getExactFieldMatchBonus(
  parsedQuery: ReturnType<typeof parseResourceQuery>,
  field: ResourceSearchField,
  value: string,
  hasIntentAlignment: boolean
): number {
  const bonus = EXACT_FIELD_MATCH_BONUSES[field];

  if (!bonus) {
    return 0;
  }

  const normalizedValue = normalizeQueryText(value);

  if (field === "city") {
    return hasIntentAlignment && parsedQuery.tokens.includes(normalizedValue)
      ? bonus
      : 0;
  }

  const matchedPhrases = parsedQuery.matchedIntents.map((match) =>
    normalizeQueryText(match.phrase)
  );

  if (matchedPhrases.some((phrase) => normalizedValue.includes(phrase))) {
    return bonus;
  }

  return 0;
}

function isLocationOnlyIntentMismatch(
  parsedQuery: ReturnType<typeof parseResourceQuery>,
  field: ResourceSearchField,
  value: string
): boolean {
  if (field === "city") {
    return true;
  }

  if (field !== "organization") {
    return false;
  }

  const normalizedValue = normalizeQueryText(value);
  const matchedPhrases = parsedQuery.matchedIntents.map((match) =>
    normalizeQueryText(match.phrase)
  );

  return !matchedPhrases.some((phrase) => normalizedValue.includes(phrase));
}

function formatIntentLabel(intent: HumanNeedId): string {
  return intent.replace(/_/g, " ");
}

export function getAvailableSearchNeeds(): HumanNeedId[] {
  return RESOURCE_INTENTS.map((intent) => intent.id);
}

export function getSearchSynonymPhrases(): string[] {
  return Object.keys(INTENT_SYNONYMS);
}
