import type {
  UnderstandingConfidenceReason,
  UnderstandingConfidenceReasonType,
} from "./types";

export function positive(message: string): UnderstandingConfidenceReason {
  return createReason("positive", message);
}

export function warning(message: string): UnderstandingConfidenceReason {
  return createReason("warning", message);
}

export function negative(message: string): UnderstandingConfidenceReason {
  return createReason("negative", message);
}

function createReason(
  type: UnderstandingConfidenceReasonType,
  message: string
): UnderstandingConfidenceReason {
  return {
    type,
    message,
  };
}
