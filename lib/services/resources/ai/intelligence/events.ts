export const RESOURCE_GUIDE_INTELLIGENCE_EVENT_VERSION = "v1" as const;

export const RESOURCE_GUIDE_INTELLIGENCE_EVENT_TYPES = {
  answerReturned: "answer_returned",
  clarificationReturned: "clarification_returned",
  feedbackSubmitted: "feedback_submitted",
  resourceClicked: "resource_clicked",
} as const;

export type ResourceGuideIntelligenceEventType =
  (typeof RESOURCE_GUIDE_INTELLIGENCE_EVENT_TYPES)[keyof typeof RESOURCE_GUIDE_INTELLIGENCE_EVENT_TYPES];
