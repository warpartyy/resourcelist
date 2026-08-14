export type EngagementPreferenceKey =
  | "immediate_mentions"
  | "immediate_critical_alerts"
  | "weekly_digest"
  | "monthly_impact_report"
  | "resource_discovery_updates"
  | "directory_coverage_updates";

export type EngagementPreferences = Record<EngagementPreferenceKey, boolean>;

export const DEFAULT_ENGAGEMENT_PREFERENCES: EngagementPreferences = {
  immediate_mentions: true,
  immediate_critical_alerts: true,
  weekly_digest: true,
  monthly_impact_report: true,
  resource_discovery_updates: false,
  directory_coverage_updates: false,
};
