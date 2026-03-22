"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { updateResource } from "@/lib/services/resourceService";
import { getSupabase } from "@/lib/supabase";

type Props = {
  resource: any;
  onSuccess?: () => void;
  confirmMessage?: string;
};

export default function RejectButton({
  resource,
  onSuccess,
  confirmMessage = "Move this resource to Rejected?",
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleReject = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const supabase = getSupabase();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await updateResource(resource.id, {
        status: "rejected",
        last_edited_by: user?.id,
        last_edited_email: user?.email,
        last_edited_at: new Date().toISOString(),
      });

      if (error) {
        console.error(error);
        toast.error("Reject failed.");
        return;
      }

      toast.success("Moved to rejected");
      onSuccess?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleReject}
      disabled={isLoading}
      className={`button button-secondary ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {isLoading ? "Rejecting..." : "Reject"}
    </button>
  );
}