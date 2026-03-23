"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { getSupabase } from "@/lib/supabase";
import { updateResource } from "@/lib/services/resourceService";

type Props = {
  resourceId: string;
  editedData: any;
  onSuccess?: () => void;
};

export default function SaveButton({
  resourceId,
  editedData,
  onSuccess,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
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

// 🔑 Fetch profile (NEW)
const { data: profile } = await supabase
  .from("profiles")
  .select("display_name, email")
  .eq("id", user.id)
  .single();

// 🔁 UPDATED payload
const { error } = await updateResource(resourceId, {
  ...editedData,
  last_edited_by: user.id, // UUID stays
  last_edited_email: user.email,
  last_edited_name: profile?.display_name || user.email, // ✅ FIXED
  last_edited_at: new Date().toISOString(), // ✅ NEW
});


      if (error) {
        console.error(error);
        toast.error("Save failed.");
        return;
      }

      toast.success("Changes saved");
      onSuccess?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <button
    onClick={handleSave}
    disabled={isLoading}
    className={`button button-primary ${
      isLoading ? "button-disabled" : ""
    }`}
  >
    {isLoading ? "Saving..." : "Save"}
  </button>
);
}