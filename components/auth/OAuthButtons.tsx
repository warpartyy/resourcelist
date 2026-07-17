"use client";

import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
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
        className="button button-secondary w-full flex items-center justify-center gap-3"
        onClick={() => signIn("google")}
      >
        <FcGoogle className="text-xl" />
        <span>Continue with Google</span>
      </button>

      <button
        type="button"
        className="button button-secondary w-full flex items-center justify-center gap-3"
        onClick={() => signIn("azure")}
      >
        <Image
          src="/icons/microsoft.svg"
          alt="Microsoft"
          width={20}
          height={20}
        />
        <span>Continue with Microsoft</span>
      </button>
    </div>
  );
}