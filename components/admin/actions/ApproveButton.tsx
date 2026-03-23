"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { updateResource } from "@/lib/services/resourceService";
import { getSupabase } from "@/lib/supabase";

type Props = {
  resource: any;
  editedData?: any;
  isEditing?: boolean;
  onSuccess?: () => void;
};

export default function ApproveButton({
  resource,
  editedData,
  isEditing = false,
  onSuccess,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
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

const finalData =
  isEditing && editedData
    ? editedData
    : resource;

// 🔁 Updated payload
const { error } = await updateResource(resource.id, {
  ...finalData, // ✅ include edits if present
  status: "approved",
  last_edited_by: user.id,
  last_edited_email: user.email,
  last_edited_name: profile?.display_name || user.email,
  last_edited_at: new Date().toISOString(),
});




      if (error) {
        console.error(error);
        toast.error("Approve failed.");
        return;
      }

      toast.success("Resource approved");
      onSuccess?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <button
    onClick={handleApprove}
    disabled={isLoading}
    className={`button button-success ${
      isLoading ? "button-disabled" : ""
    }`}
  >
    {isLoading ? "Approving..." : "Approve"}
  </button>
);
}