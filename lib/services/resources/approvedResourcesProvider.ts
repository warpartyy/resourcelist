import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/lib/database.types";

export type ApprovedResourceRow =
  Database["public"]["Tables"]["resources"]["Row"];

export async function fetchApprovedResources(): Promise<ApprovedResourceRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("status", "approved")
    .order("organization", { ascending: true });

  if (error) {
    console.error("Failed to fetch approved resources", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    return [];
  }

  return data ?? [];
}

export async function fetchApprovedResourceById(
  resourceId: string
): Promise<ApprovedResourceRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("status", "approved")
    .eq("id", resourceId)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch approved resource", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    return null;
  }

  return data;
}

export async function fetchApprovedResourceDirectorySummaries(): Promise<
  Array<Pick<ApprovedResourceRow, "id" | "organization">>
> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("resources")
    .select("id,organization")
    .eq("status", "approved")
    .order("organization", { ascending: true });

  if (error) {
    console.error("Failed to fetch approved resource summaries", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    return [];
  }

  return data ?? [];
}
