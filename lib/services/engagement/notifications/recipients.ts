import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { EngagementRecipient } from "../types";

export async function getAdminRecipients(): Promise<EngagementRecipient[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, email")
    .eq("role", "admin");

  if (error) {
    throw error;
  }

  return (data ?? []).map((profile) => ({
    id: profile.id,
    displayName: profile.display_name,
    email: profile.email,
  }));
}

export async function getRecipientsById(
  ids: string[]
): Promise<EngagementRecipient[]> {
  if (ids.length === 0) {
    return [];
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, email")
    .in("id", ids);

  if (error) {
    throw error;
  }

  return (data ?? []).map((profile) => ({
    id: profile.id,
    displayName: profile.display_name,
    email: profile.email,
  }));
}
