import { normalizeQueryText } from "../parser";
import type { ResourceRow } from "../types";
import type { DetectedLocation } from "./types";

const STATE_ALIASES: Record<string, string> = {
  ok: "OK",
  oklahoma: "OK",
  wa: "WA",
  washington: "WA",
};

export function detectLocation(
  query: string,
  resources: ResourceRow[] = []
): DetectedLocation {
  const normalizedQuery = normalizeQueryText(query);
  const city = findMatchedValue(normalizedQuery, getUniqueResourceValues(resources, "city"));
  const county = findMatchedValue(
    normalizedQuery,
    getUniqueArrayResourceValues(resources, "counties_served")
  );
  const state = detectState(normalizedQuery, resources);
  const matchedTerms = [city, county, state].filter(
    (value): value is string => Boolean(value)
  );

  return {
    ...(city ? { city } : {}),
    ...(county ? { county } : {}),
    ...(state ? { state } : {}),
    matchedTerms,
  };
}

function detectState(
  normalizedQuery: string,
  resources: ResourceRow[]
): string | undefined {
  for (const [alias, state] of Object.entries(STATE_ALIASES)) {
    if (containsNormalizedPhrase(normalizedQuery, alias)) {
      return state;
    }
  }

  return findMatchedValue(normalizedQuery, getUniqueResourceValues(resources, "state"));
}

function getUniqueResourceValues(
  resources: ResourceRow[],
  field: "city" | "state"
): string[] {
  return Array.from(
    new Set(
      resources
        .map((resource) => resource[field]?.trim())
        .filter((value): value is string => Boolean(value))
    )
  ).sort((left, right) => right.length - left.length);
}

function getUniqueArrayResourceValues(
  resources: ResourceRow[],
  field: "counties_served"
): string[] {
  return Array.from(
    new Set(
      resources
        .flatMap((resource) => resource[field] ?? [])
        .map((value) => value.trim())
        .filter(Boolean)
    )
  ).sort((left, right) => right.length - left.length);
}

function findMatchedValue(
  normalizedQuery: string,
  candidates: string[]
): string | undefined {
  return candidates.find((candidate) =>
    containsNormalizedPhrase(normalizedQuery, normalizeQueryText(candidate))
  );
}

function containsNormalizedPhrase(
  normalizedQuery: string,
  normalizedPhrase: string
): boolean {
  if (!normalizedPhrase) {
    return false;
  }

  const pattern = new RegExp(`(^|\\s)${escapeRegExp(normalizedPhrase)}(\\s|$)`);
  return pattern.test(normalizedQuery);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
