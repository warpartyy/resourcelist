import { getSupabase } from "@/lib/supabase";

/**
 * Fetch submissions by status
 */
export async function fetchSubmissionsByStatus(status: string) {
  const supabase = getSupabase();

  const { data } = await supabase
    .from("resource_submissions")
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
 * Filter approved submissions to only ones
 * that still have an existing resource
 */
export async function filterApprovedSubmissions() {
  const supabase = getSupabase();

  const { data: approvedSubs } = await supabase
    .from("resource_submissions")
    .select("id, *")
    .eq("status", "approved");

  const { data: existingResources } = await supabase
  .from("resources")
  .select("source_submission_id")
  .eq("status", "active");


  const existingIds = new Set(
    (existingResources || []).map(
      (r: any) => r.source_submission_id
    )
  );

  return (approvedSubs || []).filter((sub: any) =>
    existingIds.has(sub.id)
  );
}

/**
 * Fetch sidebar counts
 */
export async function fetchAdminCounts() {
  const supabase = getSupabase();

  // Pending submissions
  const { count: pending } = await supabase
    .from("resource_submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  // Rejected submissions
  const { count: rejected } = await supabase
    .from("resource_submissions")
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
