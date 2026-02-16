import { createClient } from "@supabase/supabase-js";

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase environment variables are missing.");
    }

    supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey
    );
  }

  return supabaseClient as any; // 👈 this fixes the TS "never" issue
}
