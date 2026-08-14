// lib/queries/buildResourceQuery.ts

import { getSupabase } from "@/lib/supabase";
import { SERVICES_BY_SUBCATEGORY } from "@/lib/constants/servicesBySubcategory";
import { PARENT_CATEGORIES, SUBCATEGORIES, TAG_GROUPS } from "@/lib/taxonomy";

type ResourceQueryFilters = {
  q?: string;
  parent?: string;
  sub?: string;
  tags?: string;
  county?: string;
  state?: string;
  status?: "approved" | "pending" | "rejected" | "deleted";
  services?: string;
  tribal?: string;
  tribe?: string;
};

export async function buildResourceQuery(filters: ResourceQueryFilters) {
  const supabase = getSupabase();
    
const { q, parent, sub, tags, services, county, state, status, tribal, tribe } = filters;

let query = supabase
  .from("resources")
  .select(`
  *,
  resource_locations (
    is_primary
  )
`);

// ✅ apply status filter FIRST
if (status) {
  query = query.eq("status", status);
} else {
  query = query.eq("status", "approved");
}

// ✅ then ordering
query = query.order("organization", { ascending: true });

  // -----------------------------
  // SEARCH (q)
  // -----------------------------
  if (q) {
    const searchPlan = buildSearchPlan(q);

    for (const token of searchPlan.tokens) {
      query = query.or(buildTokenOrConditions(token, searchPlan).join(","));
    }
  }

  // -----------------------------
  // CATEGORY FILTERS
  // -----------------------------
  if (parent) {
    query = query.contains("parent_categories", [parent]);
  }

  if (sub) {
    const subcategoryArray = sub
      .split(",")
      .map((subcategory) => subcategory.trim())
      .filter(Boolean);

    if (subcategoryArray.length === 1) {
      query = query.contains("subcategories", subcategoryArray);
    } else if (subcategoryArray.length > 1) {
      query = query.overlaps("subcategories", subcategoryArray);
    }
  }

  // -----------------------------
  // TAGS (comma-separated)
  // -----------------------------
  if (tags) {
    const tagArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (tagArray.length > 0) {
      query = query.overlaps("tags", tagArray);
    }
  }


  if (services) {
  const serviceArray = services
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (serviceArray.length > 0) {
    query = query.overlaps("services", serviceArray);
  }
}

  // -----------------------------
  // LOCATION
  // -----------------------------
  if (county) {
    query = query.contains("counties_served", [county]);
  }

  if (state) {
    query = query.eq("state", state);
  }

  // -----------------------------
  // TRIBAL ELIGIBILITY
  // -----------------------------
  if (tribal === "open_to_everyone") {
    query = query.or("tribal_eligibility.is.null,tribal_eligibility.eq.open_to_all");
  }

  if (tribal === "tribal_programs") {
    query = query.not("tribal_eligibility", "is", null);
  }

  if (tribe) {
    query = query.eq("tribe", tribe);
  }

  return query;
}

type SearchPlan = {
  normalized: string;
  tokens: string[];
  matchedParentSlugs: string[];
  matchedSubSlugs: string[];
  matchedServices: string[];
  matchedTags: string[];
  matchedCounties: string[];
};

export function buildSearchPlan(input: string): SearchPlan {
  const normalized = normalizeSearchText(input);
  const tokens = tokenizeSearchText(normalized);
  return {
    normalized,
    tokens,
    matchedParentSlugs: PARENT_CATEGORIES
      .filter((cat) => matchesRegistryValue(cat.label, normalized, tokens))
      .map((cat) => cat.value),
    matchedSubSlugs: SUBCATEGORIES
      .filter((subcat) => matchesRegistryValue(subcat.label, normalized, tokens))
      .map((subcat) => subcat.value),
    matchedServices: getAllServices().filter((service) =>
      matchesRegistryValue(service, normalized, tokens)
    ),
    matchedTags: getAllTags().filter((tag) =>
      matchesRegistryValue(tag, normalized, tokens)
    ),
    matchedCounties: getCountyCandidates(normalized, tokens),
  };
}

function buildTokenOrConditions(token: string, searchPlan: SearchPlan): string[] {
  const escapedToken = escapePostgrestPattern(token);
  const conditions = [
    `organization.ilike.%${escapedToken}%`,
    `description.ilike.%${escapedToken}%`,
    `city.ilike.%${escapedToken}%`,
  ];

  if (searchPlan.matchedSubSlugs.length > 0) {
    conditions.push(`subcategories.ov.{${searchPlan.matchedSubSlugs.join(",")}}`);
  }

  if (searchPlan.matchedParentSlugs.length > 0) {
    conditions.push(`parent_categories.ov.{${searchPlan.matchedParentSlugs.join(",")}}`);
  }

  if (searchPlan.matchedServices.length > 0) {
    conditions.push(
      `services.ov.{${searchPlan.matchedServices.map(formatArrayValue).join(",")}}`
    );
  }

  if (searchPlan.matchedTags.length > 0) {
    conditions.push(
      `tags.ov.{${searchPlan.matchedTags.map(formatArrayValue).join(",")}}`
    );
  }

  if (searchPlan.matchedCounties.length > 0) {
    conditions.push(
      `counties_served.ov.{${searchPlan.matchedCounties.map(formatArrayValue).join(",")}}`
    );
  }

  return conditions;
}

function normalizeSearchText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeSearchText(input: string): string[] {
  if (!input) {
    return [];
  }

  return Array.from(new Set(input.split(" ").filter((token) => token.length > 1)));
}

function matchesRegistryValue(
  value: string,
  normalizedQuery: string,
  tokens: string[]
): boolean {
  const normalizedValue = normalizeSearchText(value);

  if (normalizedQuery.includes(" ")) {
    return (
      normalizedValue.includes(normalizedQuery) ||
      normalizedQuery.includes(normalizedValue)
    );
  }

  return tokens.some((token) => normalizedValue.includes(token));
}

function getAllServices(): string[] {
  return Array.from(new Set(Object.values(SERVICES_BY_SUBCATEGORY).flat()));
}

function getAllTags(): string[] {
  return Array.from(new Set(Object.values(TAG_GROUPS).flat()));
}

function getCountyCandidates(normalized: string, tokens: string[]): string[] {
  const candidates = normalized.includes(" ") ? [normalized, ...tokens] : tokens;

  return Array.from(
    new Set(
      candidates
        .map((candidate) => candidate.replace(/\bcounty\b/g, "").trim())
        .filter(Boolean)
        .flatMap((candidate) => [candidate, toTitleCase(candidate)])
    )
  );
}

function escapePostgrestPattern(value: string): string {
  return value.replace(/[%_*]/g, "");
}

function formatArrayValue(value: string): string {
  return `"${value.replace(/"/g, '\\"')}"`;
}

function toTitleCase(value: string): string {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
