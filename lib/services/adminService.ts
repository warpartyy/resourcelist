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

  // Approved resources
  const { count: approvedResources } = await supabase
    .from("resources")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  // Deleted resources
  const { count: deletedResources } = await supabase
    .from("resources")
    .select("*", { count: "exact", head: true })
    .eq("status", "deleted");

    const { count: updateRequests } = await supabase
  .from('resource_submissions')
  .select('*', { count: 'exact', head: true })
  .eq('type', 'update')
  .eq('status', 'pending')


  return {
  pending: pending || 0,
  rejected: rejected || 0,
  resources: approvedResources || 0,
  deleted: deletedResources || 0,
  updateRequests: updateRequests || 0,
};
}
