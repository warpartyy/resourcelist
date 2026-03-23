"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const supabase = getSupabase();

      // 🔑 THIS is the key line
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth error:", error);
        router.replace("/login");
        return;
      }

      // 🔥 This forces Supabase to read the hash
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/admin");
      } else {
        router.replace("/login");
      }
    };

    handleAuth();
  }, [router]);

  return <p className="p-6">Signing you in...</p>;
}