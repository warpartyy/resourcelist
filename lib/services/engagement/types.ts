export type EngagementEventType =
  | "ResourceSubmitted"
  | "ResourceUpdated"
  | "UpdateSuggestionSubmitted"
  | "AdminMentioned"
  | "ResourceApproved"
  | "ResourceRejected"
  | "ResourceRestored"
  | "EventSubmitted"
  | "ContactMessageSubmitted"
  | "ResourceDiscoveryCandidate"
  | "DirectoryGapDetected"
  | "WeeklyDigest"
  | "MonthlyImpactReport";

export type EngagementDeliveryChannel =
  | "dashboard"
  | "email"
  | "weekly_digest"
  | "monthly_digest"
  | "push"
  | "sms"
  | "slack";

export type EngagementActor = {
  id?: string | null;
  displayName?: string | null;
  email?: string | null;
};

export type EngagementRecipient = {
  id: string;
  displayName?: string | null;
  email?: string | null;
};

export type EngagementEvent<TPayload = Record<string, unknown>> = {
  id: string;
  type: EngagementEventType;
  occurredAt: string;
  actor?: EngagementActor;
  payload: TPayload;
  deliveryChannels: EngagementDeliveryChannel[];
};

export type ResourceSubmittedPayload = {
  resourceId: string;
  organization: string;
  slug?: string | null;
  city?: string | null;
  state?: string | null;
  submissionDate?: string | null;
};

export type AdminMentionedPayload = {
  resourceId: string;
  resourceName: string;
  commentId: string;
  commentPreview: string;
  section: "pending" | "resources" | "rejected";
  mentionedUserIds: string[];
};

export type DashboardNotificationInput = {
  userId: string;
  type: string;
  message: string;
  resourceId?: string | null;
  commentId?: string | null;
};

export type QueuedEmail = {
  id: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  template: string;
  eventId: string;
  queuedAt: string;
};
