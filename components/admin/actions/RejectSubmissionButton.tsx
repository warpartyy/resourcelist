"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { rejectSubmission } from "@/lib/services/submissionService";

type Props = {
  submission: any;
  onSuccess?: () => void;
};

export default function RejectSubmissionButton({
  submission,
  onSuccess,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleReject = async () => {
    if (isLoading) return;


    setIsLoading(true);

    try {
      const { error } = await rejectSubmission(submission.id);

      if (error) {
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
      className={`button button-secondary ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {isLoading ? "Rejecting..." : "Reject"}
    </button>
  );
}