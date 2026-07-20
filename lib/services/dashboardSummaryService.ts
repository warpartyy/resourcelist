import { fetchAdminCounts } from "@/lib/services/adminService";
import { getSuggestedImprovementTasks } from "@/lib/services/improvements/improvementService";
import { getSupabase } from "@/lib/supabase";

export type DashboardSummary = {
  pendingResources: number;
  updateRequests: number;
  unreadNotifications: number;
  communityMessages: number;
  suggestedImprovements: number;
  upcomingEvents: number;
};

export async function fetchDashboardSummary(adminId: string): Promise<DashboardSummary> {
  const supabase = getSupabase();
  const counts = await fetchAdminCounts();

  const [
    { count: unreadNotifications, error: unreadNotificationsError },
    { count: communityMessages, error: communityMessagesError },
    { count: upcomingEvents, error: upcomingEventsError },
    improvements,
  ] =
    await Promise.all([
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", adminId)
        .eq("read", false),
      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .gte("date", new Date().toISOString().slice(0, 10)),
      getSuggestedImprovementTasks(),
    ]);

  if (unreadNotificationsError) {
    console.error("Supabase error", {
      message: unreadNotificationsError.message,
      details: unreadNotificationsError.details,
      hint: unreadNotificationsError.hint,
      code: unreadNotificationsError.code,
      error: unreadNotificationsError,
    });
    throw unreadNotificationsError;
  }

  if (communityMessagesError) {
    console.error("Supabase error", {
      message: communityMessagesError.message,
      details: communityMessagesError.details,
      hint: communityMessagesError.hint,
      code: communityMessagesError.code,
      error: communityMessagesError,
    });
    throw communityMessagesError;
  }

  if (upcomingEventsError) {
    console.error("Supabase error", {
      message: upcomingEventsError.message,
      details: upcomingEventsError.details,
      hint: upcomingEventsError.hint,
      code: upcomingEventsError.code,
      error: upcomingEventsError,
    });
    throw upcomingEventsError;
  }

  return {
    pendingResources: counts.pending,
    updateRequests: counts.updateRequests,
    unreadNotifications: unreadNotifications || 0,
    communityMessages: communityMessages || 0,
    suggestedImprovements: improvements.length,
    upcomingEvents: upcomingEvents || 0,
  };
}
