import { supabase } from "@/lib/supabase";

export async function getSubmissions(status: string) {
  return await supabase
    .from("resource_submissions")
    .select("*")
    .eq("status", status);
}

export async function rejectSubmission(id: string) {
  return await supabase
    .from("resource_submissions")
    .update({ status: "rejected" })
    .eq("id", id);
}

export async function approveSubmissionRecord(id: string) {
  return await supabase
    .from("resource_submissions")
    .update({ status: "approved" })
    .eq("id", id);
}
