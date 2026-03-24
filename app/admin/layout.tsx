"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string | null>(null);
  
  useEffect(() => {
    const checkUser = async () => {
      const supabase = getSupabase();

      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.push("/login");
        return;
      }

      const user = sessionData.session.user;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, display_name")
        .eq("id", user.id)
        .single();

      if (error || !profile) {
        console.error("Profile fetch error:", error);
        router.push("/");
        return;
      }

      if (profile.role !== "admin") {
        router.push("/");
        return;
      }

if (!profile.display_name) {
  router.push("/onboarding");
  return;
}

// ✅ store it
setDisplayName(profile.display_name);

      // ✅ Authorized
      setLoading(false);
    };

    checkUser();
  }, [router]);

  if (loading) {
    return <div className="p-6">Loading admin...</div>;
  }

return <div className="h-screen">{children}</div>;
}