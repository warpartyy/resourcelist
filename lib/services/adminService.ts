import { getSupabase } from "@/lib/supabase";

/**
 * Fetch submissions by status
 */
export async function fetchSubmissionsByStatus(status: string) {
  const supabase = getSupabase();

  const { data } = await supabase
    .from("resources")
    .select("*")
    .eq("status", status);

  return data || [];
}

/**
 * Fetch resources
 */
export async function fetchResourcesByStatus(status: string) {
  const supabase = getSupabase();

  const { data } = await supabase
    .from("resources")
    .select("*")
    .eq("status", status);

  return data || [];
}

export async function filterApprovedSubmissions() {
  const supabase = getSupabase();

  const { data } = await supabase
    .from("resources")
    .select("*")
    .eq("status", "approved");

  return data || [];
}

/**
 * Fetch sidebar counts
 */
export async function fetchAdminCounts() {
  const supabase = getSupabase();

  // Pending submissions
  const { count: pending } = await supabase
    .from("resources")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  // Rejected submissions
  const { count: rejected } = await supabase
    .from("resources")
    .select("*", { count: "exact", head: true })
    .eq("status", "rejected");

  // Active resources
  const { count: activeResources } = await supabase
    .from("resources")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // Deleted resources
  const { count: deletedResources } = await supabase
    .from("resources")
    .select("*", { count: "exact", head: true })
    .eq("status", "deleted");

  // Approved submissions that still have ACTIVE resources
  const approvedFiltered = await filterApprovedSubmissions();

  return {
    pending: pending || 0,
    approved: approvedFiltered.length,
    rejected: rejected || 0,
    resources: activeResources || 0,
    deleted: deletedResources || 0,
  };
}
