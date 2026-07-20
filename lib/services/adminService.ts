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
  const { count: pending, error: pendingError } = await supabase
    .from("resources")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  if (pendingError) {
    console.error("Supabase error", {
      message: pendingError.message,
      details: pendingError.details,
      hint: pendingError.hint,
      code: pendingError.code,
      error: pendingError,
    });
    throw pendingError;
  }

  // Rejected submissions
  const { count: rejected, error: rejectedError } = await supabase
    .from("resources")
    .select("*", { count: "exact", head: true })
    .eq("status", "rejected");

  if (rejectedError) {
    console.error("Supabase error", {
      message: rejectedError.message,
      details: rejectedError.details,
      hint: rejectedError.hint,
      code: rejectedError.code,
      error: rejectedError,
    });
    throw rejectedError;
  }

  // Approved resources
  const { count: approvedResources, error: approvedResourcesError } = await supabase
    .from("resources")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  if (approvedResourcesError) {
    console.error("Supabase error", {
      message: approvedResourcesError.message,
      details: approvedResourcesError.details,
      hint: approvedResourcesError.hint,
      code: approvedResourcesError.code,
      error: approvedResourcesError,
    });
    throw approvedResourcesError;
  }

  // Deleted resources
  const { count: deletedResources, error: deletedResourcesError } = await supabase
    .from("resources")
    .select("*", { count: "exact", head: true })
    .eq("status", "deleted");

  if (deletedResourcesError) {
    console.error("Supabase error", {
      message: deletedResourcesError.message,
      details: deletedResourcesError.details,
      hint: deletedResourcesError.hint,
      code: deletedResourcesError.code,
      error: deletedResourcesError,
    });
    throw deletedResourcesError;
  }

  const { count: updateRequests, error: updateRequestsError } = await supabase
    .from("resource_submissions")
    .select("*", { count: "exact", head: true })
    .eq("type", "update")
    .eq("status", "pending");

  if (updateRequestsError) {
    console.error("Supabase error", {
      message: updateRequestsError.message,
      details: updateRequestsError.details,
      hint: updateRequestsError.hint,
      code: updateRequestsError.code,
      error: updateRequestsError,
    });
    throw updateRequestsError;
  }


  return {
    pending: pending || 0,
    rejected: rejected || 0,
    resources: approvedResources || 0,
    deleted: deletedResources || 0,
    updateRequests: updateRequests || 0,
  };
}
