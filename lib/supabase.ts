import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// ✅ FIXED: typed client reference
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

// ✅ KEEP THIS (used across your app)
export function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }

    supabaseClient = createClient<Database>(
      supabaseUrl,
      supabaseAnonKey
    );
  }

  return supabaseClient;
}

// ✅ ALSO typed
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);