// lib/account/updateAccountClient.ts
import { getSupabase } from "@/lib/supabase";

export async function updateAccountClient({
  userId,
  displayName,
  password,
}: {
  userId: string;
  displayName?: string;
  password?: string;
}) {
  const supabase = getSupabase();

  // 1. Update password (optional)
  if (password) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error("Failed to update password");
  }

  // 2. Update profile (optional)
  if (displayName) {
    const { data, error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", userId)
      .select("display_name")
      .single();

    if (error) throw new Error("Failed to update profile");

    return data;
  }

  return null;
}