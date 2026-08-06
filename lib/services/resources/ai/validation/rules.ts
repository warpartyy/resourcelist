import type { ValidationContext, ValidationIssue, ValidationRule } from "./types";

const ORGANIZATION_SUFFIXES = [
  "Agency",
  "Alliance",
  "Association",
  "Center",
  "Centre",
  "Clinic",
  "Coalition",
  "Council",
  "Department",
  "Foundation",
  "Group",
  "Health",
  "Hospital",
  "Initiative",
  "Ministries",
  "Ministry",
  "Network",
  "Office",
  "Organization",
  "Pantry",
  "Program",
  "Project",
  "Services",
  "Shelter",
  "Society",
];

const ELIGIBILITY_CLAIM_PATTERNS = [
  /\bmust be\s+([^.;,\n]+)/gi,
  /\bneed to be\s+([^.;,\n]+)/gi,
  /\brequires?\s+([^.;,\n]+)/gi,
  /\beligible if\s+([^.;,\n]+)/gi,
  /\bonly available to\s+([^.;,\n]+)/gi,
];

const ELIGIBILITY_KEYWORDS = [
  "veteran",
  "veterans",
  "senior",
  "seniors",
  "adult",
  "adults",
  "youth",
  "children",
  "families",
  "pregnant",
  "women",
  "men",
  "referral",
  "income",
  "medicaid",
  "medicare",
  "uninsured",
  "homeless",
];

const TRIBAL_ELIGIBILITY_KEYWORDS = [
  "tribal",
  "tribe",
  "native",
  "federally recognized",
  "tribal member",
  "native household",
];

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

export const VALIDATION_RULES: ValidationRule[] = [
  {
    id: "unknown_organization",
    name: "Unknown Organization",
    validate: validateUnknownOrganization,
  },
  {
    id: "unknown_website",
    name: "Unknown Website",
    validate: validateUnknownWebsite,
  },
  {
    id: "unknown_phone_number",
    name: "Unknown Phone Number",
    validate: validateUnknownPhoneNumber,
  },
  {
    id: "unsupported_eligibility",
    name: "Unsupported Eligibility",
    validate: validateUnsupportedEligibility,
  },
  {
    id: "unsupported_tribal_eligibility",
    name: "Unsupported Tribal Eligibility",
    validate: validateUnsupportedTribalEligibility,
  },
  {
    id: "fabricated_resource_count",
    name: "Fabricated Resource Count",
    validate: validateFabricatedResourceCount,
  },
  {
    id: "empty_recommendation",
    name: "Empty Recommendation",
    validate: validateEmptyRecommendation,
  },
];

function validateUnknownOrganization({
  responseText,
  groundedResources,
}: ValidationContext): ValidationIssue[] {
  const allowedNames = groundedResources
    .map((item) => item.resource.organization)
    .filter((value): value is string => Boolean(value))
    .map(normalizeText);
  const candidates = extractOrganizationCandidates(responseText);

  return candidates
    .filter((candidate) => !allowedNames.includes(normalizeText(candidate)))
    .map((candidate) => ({
      ruleId: "unknown_organization",
      severity: "error",
      description:
        "The response mentions an organization that is not in the grounded resources.",
      evidence: candidate,
    }));
}

function validateUnknownWebsite({
  responseText,
  groundedResources,
}: ValidationContext): ValidationIssue[] {
  const allowedUrls = new Set(
    groundedResources.flatMap((item) => [
      normalizeUrl(item.resource.website),
      normalizeUrl(item.resource.application_link),
    ])
  );

  return extractUrls(responseText)
    .filter((url) => !allowedUrls.has(normalizeUrl(url)))
    .map((url) => ({
      ruleId: "unknown_website",
      severity: "error",
      description:
        "The response includes a URL that is not present in the grounded resource payload.",
      evidence: url,
    }));
}

function validateUnknownPhoneNumber({
  responseText,
  groundedResources,
}: ValidationContext): ValidationIssue[] {
  const allowedPhones = new Set(
    groundedResources
      .map((item) => normalizePhone(item.resource.phone))
      .filter(Boolean)
  );

  return extractPhoneNumbers(responseText)
    .filter((phone) => !allowedPhones.has(normalizePhone(phone)))
    .map((phone) => ({
      ruleId: "unknown_phone_number",
      severity: "error",
      description:
        "The response includes a phone number that is not present in the grounded resources.",
      evidence: phone,
    }));
}

function validateUnsupportedEligibility({
  responseText,
  groundedResources,
}: ValidationContext): ValidationIssue[] {
  const eligibilityText = normalizeText(
    groundedResources.map((item) => item.resource.eligibility ?? "").join(" ")
  );
  const claims = extractEligibilityClaims(responseText).filter((claim) =>
    ELIGIBILITY_KEYWORDS.some((keyword) => normalizeText(claim).includes(keyword))
  );

  return claims
    .filter((claim) => !eligibilityText.includes(normalizeText(claim)))
    .map((claim) => ({
      ruleId: "unsupported_eligibility",
      severity: "warning",
      description:
        "The response states an eligibility requirement that is not present in the grounded eligibility fields.",
      evidence: claim,
    }));
}

function validateUnsupportedTribalEligibility({
  responseText,
  groundedResources,
}: ValidationContext): ValidationIssue[] {
  const tribalEligibilityText = normalizeText(
    groundedResources
      .map((item) => item.resource.tribal_eligibility ?? "")
      .join(" ")
  );
  const response = normalizeText(responseText);

  if (!TRIBAL_ELIGIBILITY_KEYWORDS.some((keyword) => response.includes(keyword))) {
    return [];
  }

  if (
    TRIBAL_ELIGIBILITY_KEYWORDS.some((keyword) =>
      tribalEligibilityText.includes(keyword)
    )
  ) {
    return [];
  }

  return [
    {
      ruleId: "unsupported_tribal_eligibility",
      severity: "warning",
      description:
        "The response references tribal eligibility that is not present in the grounded tribal eligibility fields.",
      evidence: "Tribal eligibility claim detected in response.",
    },
  ];
}

function validateFabricatedResourceCount({
  responseText,
  groundedResources,
}: ValidationContext): ValidationIssue[] {
  const countMatches = extractResourceCountClaims(responseText);

  return countMatches
    .filter((claim) => claim.count !== groundedResources.length)
    .map((claim) => ({
      ruleId: "fabricated_resource_count",
      severity: "warning",
      description:
        "The response states a matching resource count that does not match the grounded resource payload.",
      evidence: claim.evidence,
    }));
}

function validateEmptyRecommendation({
  responseText,
  groundedResources,
}: ValidationContext): ValidationIssue[] {
  if (groundedResources.length === 0) {
    return [];
  }

  const response = normalizeText(responseText);
  const referencedResources = groundedResources.filter((item) => {
    const name = item.resource.organization;

    return name ? response.includes(normalizeText(name)) : false;
  });

  if (referencedResources.length > 0) {
    return [];
  }

  return [
    {
      ruleId: "empty_recommendation",
      severity: "error",
      description:
        "High-confidence grounded resources exist, but none are referenced in the response.",
      evidence: "No grounded organization names found in response.",
    },
  ];
}

function extractOrganizationCandidates(responseText: string): string[] {
  const candidates = new Set<string>();
  const capitalizedPhrasePattern =
    /\b([A-Z][A-Za-z&'’-]*(?:\s+[A-Z][A-Za-z&'’-]*){0,6})\b/g;
  let match: RegExpExecArray | null;

  while ((match = capitalizedPhrasePattern.exec(responseText)) !== null) {
    const candidate = match[1].trim();

    if (ORGANIZATION_SUFFIXES.some((suffix) => candidate.endsWith(suffix))) {
      candidates.add(candidate);
    }
  }

  return Array.from(candidates);
}

function extractUrls(responseText: string): string[] {
  return responseText.match(/\bhttps?:\/\/[^\s)]+|\bwww\.[^\s)]+/gi) ?? [];
}

function extractPhoneNumbers(responseText: string): string[] {
  return (
    responseText.match(
      /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b/g
    ) ?? []
  );
}

function extractEligibilityClaims(responseText: string): string[] {
  return ELIGIBILITY_CLAIM_PATTERNS.flatMap((pattern) =>
    Array.from(responseText.matchAll(pattern)).map((match) => match[1].trim())
  );
}

function extractResourceCountClaims(
  responseText: string
): Array<{ count: number; evidence: string }> {
  const matches = Array.from(
    responseText.matchAll(
      /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:matching\s+)?(?:organizations?|resources?)\b/gi
    )
  );

  return matches
    .map((match) => ({
      count: parseCount(match[1]),
      evidence: match[0],
    }))
    .filter((claim) => claim.count !== null) as Array<{
    count: number;
    evidence: string;
  }>;
}

function parseCount(value: string): number | null {
  const normalized = value.toLowerCase();

  if (normalized in NUMBER_WORDS) {
    return NUMBER_WORDS[normalized];
  }

  const parsed = Number.parseInt(normalized, 10);

  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeUrl(value: string | null): string {
  if (!value) {
    return "";
  }

  return value
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "")
    .trim();
}

function normalizePhone(value: string | null): string {
  return value?.replace(/\D/g, "") ?? "";
}
