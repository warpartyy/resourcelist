import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { DashboardNotificationInput } from "../types";

export async function createDashboardNotifications(
  notifications: DashboardNotificationInput[]
): Promise<void> {
  if (notifications.length === 0) {
    return;
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("notifications").insert(
    notifications.map((notification) => ({
      user_id: notification.userId,
      type: notification.type,
      message: notification.message,
      resource_id: notification.resourceId ?? null,
      comment_id: notification.commentId ?? null,
      read: false,
    }))
  );

  if (error) {
    throw error;
  }
}
