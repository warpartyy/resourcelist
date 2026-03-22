"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { getSupabase } from "@/lib/supabase";
import { updateSubmissionRecord } from "@/lib/services/submissionService";

type Props = {
  submissionId: string;
  editedSubmission: any;
  onSuccess?: () => void;
};

export default function SaveSubmissionButton({
  submissionId,
  editedSubmission,
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

      const { error } = await updateSubmissionRecord(submissionId, {
        ...editedSubmission,
        last_edited_by: user?.id,
        last_edited_email: user?.email,
        last_edited_at: new Date().toISOString(),
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
      className={`button button-secondary ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {isLoading ? "Saving..." : "Save"}
    </button>
  );
}