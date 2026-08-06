import { normalizeQueryText } from "../parser";
import {
  detectIntentConfidence,
  getPrimaryNeed,
  getSecondaryNeeds,
} from "./intentDetector";
import { detectLocation } from "./locationDetector";
import {
  detectSituations,
  getDerivedNeeds,
  getMatchedSituationTerms,
  getSituationConfidence,
} from "./situationDetector";
import { detectUrgency } from "./urgencyDetector";
import type {
  RequestUnderstanding,
  RequestUnderstandingInput,
} from "./types";

export function understandResourceRequest({
  query,
  resources = [],
}: RequestUnderstandingInput): RequestUnderstanding {
  const intentConfidence = detectIntentConfidence(query);
  const situations = detectSituations(query);

  return {
    normalizedQuery: normalizeQueryText(query),
    primaryNeed: getPrimaryNeed(intentConfidence),
    secondaryNeeds: getSecondaryNeeds(intentConfidence),
    intentConfidence,
    location: detectLocation(query, resources),
    urgency: detectUrgency(query),
    situations,
    derivedNeeds: getDerivedNeeds(situations),
    situationConfidence: getSituationConfidence(situations),
    matchedSituationTerms: getMatchedSituationTerms(situations),
  };
}
