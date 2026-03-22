"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { getSupabase } from "@/lib/supabase";
import { updateResource } from "@/lib/services/resourceService";
import { approveSubmissionRecord } from "@/lib/services/submissionService";

type Props = {
  submission: any;
  editedSubmission?: any;
  isEditing?: boolean;
  onSuccess?: () => void;
};

export default function ApproveSubmissionButton({
  submission,
  editedSubmission,
  isEditing,
  onSuccess,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    if (isLoading) return;

    const confirmAction = confirm("Approve this submission?");
    if (!confirmAction) return;

    setIsLoading(true);

    try {
      const supabase = getSupabase();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const finalData =
        isEditing && editedSubmission
          ? editedSubmission
          : submission;

      const { error } = await updateResource(submission.id, {
        ...finalData,
        status: "approved",
        last_edited_by: user?.id,
        last_edited_email: user?.email,
        last_edited_at: new Date().toISOString(),
      });

      if (error) {
        console.error(error);
        toast.error("Approve failed.");
        return;
      }

      await approveSubmissionRecord(submission.id);

      toast.success("Submission approved");
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