import { getSupabase } from "@/lib/supabase";

export async function getSubmissions(status: string) {
  const supabase = getSupabase();

  return await supabase
    .from("resources")
    .select("*")
    .eq("status", status);
}

export async function rejectSubmission(id: string) {
  const supabase = getSupabase();
  return await supabase
    .from("resources")
    .update({ status: "rejected" })
    .eq("id", id);
}

export async function approveSubmissionRecord(id: string) {
  const supabase = getSupabase();
  return await supabase
    .from("resources")
    .update({ status: "approved" })
    .eq("id", id);
}

export async function updateSubmissionRecord(
  id: string,
  updates: any
) {
  const supabase = getSupabase();

  return await supabase
  .from("resources")
  .select("*")
  .eq("status", status)
  .order("id", { ascending: false });
}