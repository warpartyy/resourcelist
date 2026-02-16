import { getSupabase } from "@/lib/supabase";

export async function getSubmissions(status: string) {
  const supabase = getSupabase();

  return await supabase
    .from("resource_submissions")
    .select("*")
    .eq("status", status);
}



export async function rejectSubmission(id: string) {
  const supabase = getSupabase();
  return await supabase
    .from("resource_submissions")
    .update({ status: "rejected" })
    .eq("id", id);
}

export async function approveSubmissionRecord(id: string) {
  const supabase = getSupabase();
  return await supabase
    .from("resource_submissions")
    .update({ status: "approved" })
    .eq("id", id);
}
