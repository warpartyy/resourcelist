import {
  DEFAULT_ENGAGEMENT_PREFERENCES,
  type EngagementPreferences,
} from "./types";

export async function getEngagementPreferences(
  userId: string
): Promise<EngagementPreferences> {
  void userId;
  return DEFAULT_ENGAGEMENT_PREFERENCES;
}
