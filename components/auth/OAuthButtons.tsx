"use client";

import { getSupabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function OAuthButtons() {
  const signIn = async (provider: "google" | "azure") => {
    const supabase = getSupabase();

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="button button-secondary w-full"
        onClick={() => signIn("google")}
      >
        Continue with Google
      </button>

      <button
        type="button"
        className="button button-secondary w-full"
        onClick={() => signIn("azure")}
      >
        Continue with Microsoft
      </button>
    </div>
  );
}