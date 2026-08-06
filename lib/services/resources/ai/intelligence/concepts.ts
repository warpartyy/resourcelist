import { normalizeQueryText, tokenizeQuery } from "@/lib/services/resources/intelligence/parser";
import type { ResourceSearchResponse } from "@/lib/services/resources/intelligence/searchEngine";
import type { GeographicIntelligence } from "./types";
import { sanitizeConcepts, sanitizeGeography, uniqueStrings } from "./sanitizer";

const CONCEPT_PATTERNS: Array<{
  concept: string;
  terms: string[];
}> = [
  {
    concept: "hospital",
    terms: ["hospital", "hospitals", "er", "emergency room", "urgent care"],
  },
  {
    concept: "rental assistance",
    terms: ["rent", "rental assistance", "paying rent", "eviction"],
  },
  {
    concept: "therapy",
    terms: ["therapist", "therapy", "counseling", "counselor"],
  },
  {
    concept: "rehabilitation",
    terms: ["rehab", "rehabilitation", "detox", "recovery", "addiction"],
  },
  {
    concept: "food pantry",
    terms: ["food pantry", "pantry", "groceries", "food bank"],
  },
  {
    concept: "utility assistance",
    terms: ["utility", "utilities", "electric", "electricity", "water bill", "gas bill"],
  },
  {
    concept: "transportation",
    terms: ["ride", "bus", "transportation", "gas voucher"],
  },
  {
    concept: "dental",
    terms: ["dentist", "dental"],
  },
  {
    concept: "employment",
    terms: ["job", "jobs", "work", "resume", "interview"],
  },
  {
    concept: "legal assistance",
    terms: ["legal", "lawyer", "attorney", "court"],
  },
];

const STATE_LABELS: Record<string, string> = {
  ok: "Oklahoma",
  oklahoma: "Oklahoma",
  wa: "Washington",
  washington: "Washington",
};

export function extractSearchConcepts({
  normalizedQuery,
  expandedTerms,
}: {
  normalizedQuery?: string | null;
  expandedTerms?: string[];
}): string[] {
  const normalized = normalizeQueryText(normalizedQuery ?? "");
  const terms = new Set([
    ...tokenizeQuery(normalized),
    ...(expandedTerms ?? []).map(normalizeQueryText),
  ]);
  const concepts: string[] = [];

  for (const pattern of CONCEPT_PATTERNS) {
    if (
      pattern.terms.some((term) => {
        const normalizedTerm = normalizeQueryText(term);
        return terms.has(normalizedTerm) || normalized.includes(normalizedTerm);
      })
    ) {
      concepts.push(pattern.concept);
    }
  }

  return sanitizeConcepts(concepts);
}

export function extractGeographicIntelligence(
  searchResults: Pick<ResourceSearchResponse, "normalizedQuery" | "results">
): GeographicIntelligence | undefined {
  const queryTokens = new Set(tokenizeQuery(searchResults.normalizedQuery));
  const city = findMatchedReasonValue(searchResults, "city");
  const county = findMatchedReasonValue(searchResults, "counties_served");
  const state =
    findMatchedReasonValue(searchResults, "state") ??
    Object.entries(STATE_LABELS).find(([token]) => queryTokens.has(token))?.[1];

  return sanitizeGeography({
    ...(city ? { city } : {}),
    ...(county ? { county: trimCountySuffix(county) } : {}),
    ...(state ? { state: STATE_LABELS[state.toLowerCase()] ?? state } : {}),
  });
}

function findMatchedReasonValue(
  searchResults: Pick<ResourceSearchResponse, "results">,
  field: string
): string | undefined {
  const values = searchResults.results
    .flatMap((result) => result.reasons)
    .filter((reason) => reason.field === field)
    .map((reason) => reason.matchedValue)
    .filter(Boolean);

  return uniqueStrings(values)[0];
}

function trimCountySuffix(value: string): string {
  return value.replace(/\s+county$/i, "").trim();
}
