"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const supabase = getSupabase();
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const callbackError =
          url.searchParams.get("error_description") || url.searchParams.get("error");

        if (callbackError) {
          console.error("OAuth callback error:", callbackError);
          router.replace("/login");
          return;
        }

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error("OAuth exchange error:", exchangeError);
            router.replace("/login");
            return;
          }
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          if (sessionError) console.error("Session error:", sessionError);
          router.replace("/login");
          return;
        }
        router.replace("/admin");
      } catch (error) {
        console.error("Auth callback failure:", error);
        router.replace("/login");
      }
    };

    handleAuth();
  }, [router]);

  return <p className="p-6">Signing you in...</p>;
}