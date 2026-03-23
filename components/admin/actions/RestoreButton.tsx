"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { restoreResource } from "@/lib/services/resourceService";
import { getSupabase } from "@/lib/supabase";

type Props = {
  resource: any;
  onSuccess?: () => void;
};

export default function RestoreButton({
  resource,
  onSuccess,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRestore = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const supabase = getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("User not found");
        return;
      }

// 🔑 Fetch profile
const { data: profile } = await supabase
  .from("profiles")
  .select("display_name, email")
  .eq("id", user.id)
  .single();

const { error } = await restoreResource(resource.id, {
  last_edited_by: user.id,
  last_edited_email: user.email!,
  last_edited_name: profile?.display_name || user.email!,
});

      if (error) {
        console.error(error);
        toast.error("Restore failed.");
        return;
      }

      toast.success("Resource restored");
      onSuccess?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <button
    onClick={handleRestore}
    disabled={isLoading}
    className={`button button-success ${
      isLoading ? "button-disabled" : ""
    }`}
  >
    {isLoading ? "Restoring..." : "Restore"}
  </button>
);
}