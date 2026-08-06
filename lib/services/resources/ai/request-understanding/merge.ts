import type {
  MergeRequestUnderstandingInput,
  MergedRequestUnderstanding,
} from "./types";

const AI_CONFIDENCE_THRESHOLD = 0.75;

export function mergeRequestUnderstanding({
  deterministic,
  ai,
}: MergeRequestUnderstandingInput): MergedRequestUnderstanding {
  const mergeNotes: MergedRequestUnderstanding["mergeNotes"] = [];
  const useAiPrimaryNeed =
    !deterministic.primaryNeed &&
    Boolean(ai.primaryNeed) &&
    ai.confidence >= AI_CONFIDENCE_THRESHOLD;

  if (useAiPrimaryNeed) {
    mergeNotes.push({
      field: "primaryNeed",
      source: "ai",
      reason: "AI provided a high-confidence primary need where deterministic detection found none.",
    });
  } else {
    mergeNotes.push({
      field: "primaryNeed",
      source: "deterministic",
      reason: "Deterministic understanding remains authoritative by default.",
    });
  }

  return {
    ...deterministic,
    primaryNeed: useAiPrimaryNeed ? ai.primaryNeed : deterministic.primaryNeed,
    aiUnderstanding: ai,
    mergeNotes,
  };
}
