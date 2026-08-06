import { RESOURCE_INTENTS } from "./intents";
import { normalizeQueryText, tokenizeQuery } from "./parser";
import { INTENT_SYNONYMS } from "./synonyms";
import type {
  FieldScoreBreakdown,
  NormalizedQuery,
  ResourceRow,
  ResourceSearchField,
  HumanNeedId,
} from "./types";

export const RESOURCE_FIELD_WEIGHTS: Record<ResourceSearchField, number> = {
  organization: 50,
  city: 30,
  services: 8,
  tags: 7,
  subcategories: 6,
  parent_categories: 5,
  description: 3,
  eligibility: 3,
  tribal_eligibility: 3,
  counties_served: 2,
};

const INTENT_LABELS = Object.fromEntries(
  RESOURCE_INTENTS.map((intent) => [intent.id, intent.label])
);

export const INTENT_RELEVANCE_BOOST = 40;

const INTENT_RELEVANCE_TERMS: Record<HumanNeedId, string[]> = {
  healthcare: [
    "hospital",
    "clinic",
    "medical",
    "healthcare",
    "health care",
    "behavioral health",
    "mental health",
    "urgent care",
    "emergency room",
    "primary care",
    "dental",
    "dentist",
    "surgery",
    "imaging",
  ],
  mental_health: [
    "behavioral health",
    "mental health",
    "therapy",
    "therapist",
    "counseling",
    "counselor",
    "psychiatric",
    "psychiatry",
    "psychologist",
  ],
  substance_use: [
    "substance use",
    "substance abuse",
    "addiction",
    "rehab",
    "rehabilitation",
    "detox",
    "recovery",
    "sober living",
    "treatment",
  ],
  housing: [
    "housing",
    "rental assistance",
    "rent assistance",
    "eviction",
    "eviction prevention",
    "shelter",
    "homeless",
  ],
  food: [
    "food",
    "pantry",
    "food pantry",
    "food bank",
    "meals",
    "groceries",
    "grocery",
    "food distribution",
  ],
  utilities: [
    "utility",
    "utilities",
    "utility assistance",
    "electric",
    "electricity",
    "water bill",
    "gas bill",
  ],
  transportation: [
    "transportation",
    "transit",
    "bus",
    "ride",
    "rides",
    "vehicle",
    "gas voucher",
  ],
  legal: ["legal", "lawyer", "attorney", "court", "custody", "advocacy"],
  employment: [
    "employment",
    "job",
    "jobs",
    "workforce",
    "resume",
    "interview",
    "training",
  ],
  financial_assistance: [
    "financial",
    "financial assistance",
    "benefits",
    "cash",
    "emergency funds",
  ],
  childcare: ["childcare", "child care", "daycare", "early childhood"],
  family_support: ["family", "parenting", "caregiver", "kinship"],
  youth: ["youth", "teen", "children", "young adult"],
  safety: ["safety", "domestic violence", "abuse", "protective"],
  crisis: ["crisis", "hotline", "crisis response"],
  tribal_services: ["tribal", "native", "tribe", "native-led"],
};

const INTENT_RELEVANCE_FIELDS: ResourceSearchField[] = [
  "parent_categories",
  "subcategories",
  "services",
  "tags",
];

export function scoreResource(query: NormalizedQuery, resource: ResourceRow): number {
  return getResourceScoreBreakdown(query, resource).total;
}

export function getResourceScoreBreakdown(
  query: NormalizedQuery,
  resource: ResourceRow
): { total: number; fields: FieldScoreBreakdown } {
  const queryTerms = buildQueryTerms(query);
  const fields: FieldScoreBreakdown = {};

  for (const field of Object.keys(RESOURCE_FIELD_WEIGHTS) as ResourceSearchField[]) {
    const fieldScore = scoreField(query, queryTerms, getResourceFieldValues(resource, field));

    if (fieldScore > 0) {
      fields[field] = fieldScore * RESOURCE_FIELD_WEIGHTS[field];
    }
  }

  const total = Object.values(fields).reduce((sum, score) => sum + score, 0);

  return { total, fields };
}

export function buildQueryTerms(query: NormalizedQuery): string[] {
  const terms = new Set(query.tokens);

  for (const match of query.matchedIntents) {
    terms.add(normalizeQueryText(match.intent));
    terms.add(normalizeQueryText(INTENT_LABELS[match.intent] ?? match.intent));

    for (const [phrase, intents] of Object.entries(INTENT_SYNONYMS)) {
      if (intents.includes(match.intent)) {
        terms.add(normalizeQueryText(phrase));
      }
    }
  }

  return Array.from(terms).filter(Boolean);
}

export function getIntentRelevanceScore(
  detectedNeeds: HumanNeedId[],
  resource: ResourceRow
): number {
  let score = 0;

  for (const need of detectedNeeds) {
    if (resourceMatchesIntent(need, resource)) {
      score += INTENT_RELEVANCE_BOOST;
    }
  }

  return score;
}

export function getResourceIntentRelevanceMatches(
  detectedNeeds: HumanNeedId[],
  resource: ResourceRow
): HumanNeedId[] {
  return detectedNeeds.filter((need) => resourceMatchesIntent(need, resource));
}

export function getResourceFieldValues(
  resource: ResourceRow,
  field: ResourceSearchField
): string[] {
  const value = resource[field];

  if (Array.isArray(value)) {
    return value.filter((item): item is string => Boolean(item));
  }

  return value ? [value] : [];
}

function scoreField(
  query: NormalizedQuery,
  queryTerms: string[],
  fieldValues: string[]
): number {
  if (!query.normalized || fieldValues.length === 0) {
    return 0;
  }

  let score = 0;

  for (const value of fieldValues) {
    score += scoreResourceFieldValue(query, queryTerms, value);
  }

  return score;
}

export function scoreResourceFieldValue(
  query: NormalizedQuery,
  queryTerms: string[],
  value: string
): number {
  const normalizedValue = normalizeQueryText(value);

  if (!query.normalized || !normalizedValue) {
    return 0;
  }

  let score = 0;

  if (normalizedValue === query.normalized) {
    score += 3;
  } else if (normalizedValue.includes(query.normalized)) {
    score += 2;
  }

  const valueTokens = new Set(tokenizeQuery(normalizedValue));

  for (const term of queryTerms) {
    if (term.includes(" ")) {
      if (normalizedValue.includes(term)) {
        score += 2;
      }

      continue;
    }

    if (valueTokens.has(term)) {
      score += 1;
    }
  }

  return score;
}

function resourceMatchesIntent(need: HumanNeedId, resource: ResourceRow): boolean {
  const terms = INTENT_RELEVANCE_TERMS[need].map(normalizeQueryText);

  for (const field of INTENT_RELEVANCE_FIELDS) {
    for (const value of getResourceFieldValues(resource, field)) {
      const normalizedValue = normalizeQueryText(value);

      if (terms.some((term) => normalizedValue.includes(term))) {
        return true;
      }
    }
  }

  return false;
}
