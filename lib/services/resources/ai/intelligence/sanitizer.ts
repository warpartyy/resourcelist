import type { GeographicIntelligence } from "./types";

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_PATTERN = /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g;
const SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/g;
const ZIP_PATTERN = /\b\d{5}(?:-\d{4})?\b/g;
const DOB_PATTERN = /\b(?:\d{1,2}[/-]){2}\d{2,4}\b/g;
const STREET_ADDRESS_PATTERN =
  /\b\d{1,6}\s+[a-z0-9.'-]+(?:\s+[a-z0-9.'-]+){0,4}\s+(?:st|street|ave|avenue|rd|road|dr|drive|ln|lane|blvd|boulevard|ct|court|way|apt|apartment|unit)\b/gi;
const NAME_CLAIM_PATTERN = /\b(?:my name is|i am|i'm)\s+[a-z]+(?:\s+[a-z]+)?\b/gi;

export function sanitizeFreeText(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return value
    .replace(EMAIL_PATTERN, "")
    .replace(PHONE_PATTERN, "")
    .replace(SSN_PATTERN, "")
    .replace(DOB_PATTERN, "")
    .replace(STREET_ADDRESS_PATTERN, "")
    .replace(NAME_CLAIM_PATTERN, "")
    .replace(ZIP_PATTERN, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeConcepts(concepts: string[]): string[] {
  return uniqueStrings(
    concepts
      .map((concept) => sanitizeFreeText(concept).toLowerCase())
      .filter(Boolean)
  );
}

export function sanitizeGeography(
  location: GeographicIntelligence | undefined
): GeographicIntelligence | undefined {
  if (!location) {
    return undefined;
  }

  const city = sanitizePlaceName(location.city);
  const county = sanitizePlaceName(location.county);
  const state = sanitizePlaceName(location.state);

  if (!city && !county && !state) {
    return undefined;
  }

  return {
    ...(city ? { city } : {}),
    ...(county ? { county } : {}),
    ...(state ? { state } : {}),
  };
}

export function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function sanitizePlaceName(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const sanitized = sanitizeFreeText(value).replace(/[^a-zA-Z\s.-]/g, "").trim();
  return sanitized || undefined;
}
