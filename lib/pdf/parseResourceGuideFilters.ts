import type { ResourceGuideFilters } from "@/lib/pdf/types";

function readParam(searchParams: URLSearchParams, key: keyof ResourceGuideFilters) {
  const value = searchParams.get(key);
  if (!value) return undefined;
  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : undefined;
}

export function parseResourceGuideFilters(searchParams: URLSearchParams): ResourceGuideFilters {
  return {
    q: readParam(searchParams, "q"),
    parent: readParam(searchParams, "parent"),
    sub: readParam(searchParams, "sub"),
    tags: readParam(searchParams, "tags"),
    county: readParam(searchParams, "county"),
    state: readParam(searchParams, "state"),
  };
}
