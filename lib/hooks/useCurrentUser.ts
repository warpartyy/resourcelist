"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      const supabase = getSupabase();
      const { data } = await supabase.auth.getUser();

      if (mounted) {
        setUser(data.user);
        setLoading(false);
      }
    };

    fetchUser();

    return () => {
      mounted = false;
    };
  }, []);

  return { user, loading };
}