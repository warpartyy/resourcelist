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

  const [{ count: unreadNotifications }, { count: communityMessages }, { count: upcomingEvents }, improvements] =
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

  return {
    pendingResources: counts.pending,
    updateRequests: counts.updateRequests,
    unreadNotifications: unreadNotifications || 0,
    communityMessages: communityMessages || 0,
    suggestedImprovements: improvements.length,
    upcomingEvents: upcomingEvents || 0,
  };
}
