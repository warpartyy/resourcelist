"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { moveResourceToPending } from "@/lib/services/resourceService";
import { getSupabase } from "@/lib/supabase";

type Props = {
  submission: any;
  onSuccess?: () => void;
};

export default function MoveSubmissionToPendingButton({
  submission,
  onSuccess,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleMoveToPending = async () => {
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

const { error } = await moveResourceToPending(submission.id, {
  last_edited_by: user.id,
  last_edited_email: user.email!,
  last_edited_name: profile?.display_name || user.email!,
});

      if (error) {
        console.error(error);
        toast.error("Move to pending failed.");
        return;
      }

      toast.success("Moved to pending");
      onSuccess?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <button
    onClick={handleMoveToPending}
    disabled={isLoading}
    className={`button button-secondary ${
      isLoading ? "button-disabled" : ""
    }`}
  >
    {isLoading ? "Moving..." : "Move to Pending"}
  </button>
);
}