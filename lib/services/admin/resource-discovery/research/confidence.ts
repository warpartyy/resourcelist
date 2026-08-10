import type {
  ResourceDiscoveryCandidate,
  ResourceDiscoveryConfidence,
} from "../types";

export type DiscoveryConfidenceInput = Pick<
  ResourceDiscoveryCandidate,
  | "website"
  | "phone"
  | "address"
  | "services"
  | "countiesServed"
  | "evidence"
> & {
  geographyMatches: boolean;
  categoryMatches: boolean;
};

export function calculateDiscoveryConfidence({
  website,
  phone,
  address,
  services,
  countiesServed,
  evidence,
  geographyMatches,
  categoryMatches,
}: DiscoveryConfidenceInput): ResourceDiscoveryConfidence {
  let score = 0;

  if (website) score += 20;
  if (phone) score += 15;
  if (address) score += 15;
  if (services.length > 0) score += 15;
  if (countiesServed.length > 0) score += 10;
  if (geographyMatches) score += 10;
  if (categoryMatches) score += 10;
  if (evidence.length >= 2) score += 5;

  if (score >= 75) return "High";
  if (score >= 45) return "Medium";
  return "Low";
}
