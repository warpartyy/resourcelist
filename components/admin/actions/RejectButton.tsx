"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { updateResource } from "@/lib/services/resourceService";
import { getSupabase } from "@/lib/supabase";

type Props = {
  resource: any;
  onSuccess?: () => void;
};

export default function RejectButton({
  resource,
  onSuccess,
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

// 🔁 Updated payload
const now = new Date().toISOString();

const { error } = await updateResource(resource.id, {
  status: "rejected",
  rejected_at: now,
  last_edited_by: user.id,
  last_edited_email: user.email,
  last_edited_name: profile?.display_name || user.email,
  last_edited_at: now,
});

    if (error) {
      console.error(error);
      toast.error("Reject failed.");
      return;
    }

    toast.success("Submission rejected");
    onSuccess?.();
  } finally {
    setIsLoading(false);
  }
};

  return (
  <button
    onClick={handleReject}
    disabled={isLoading}
    className={`button button-danger ${
      isLoading ? "button-disabled" : ""
    }`}
  >
    {isLoading ? "Rejecting..." : "Reject"}
  </button>
);
}