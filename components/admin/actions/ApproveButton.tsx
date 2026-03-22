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

      const finalData =
        isEditing && editedData
          ? editedData
          : resource;

      const { error } = await updateResource(resource.id, {
  status: "rejected",
  last_edited_by: user?.id,
  last_edited_email: user?.email,
  last_edited_name: user?.user_metadata?.display_name ?? null,
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
      className={`button button-primary ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {isLoading ? "Approving..." : "Approve"}
    </button>
  );
}