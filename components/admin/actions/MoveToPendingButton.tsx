"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { moveResourceToPending } from "@/lib/services/resourceService";

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
const { error } = await moveResourceToPending(submission.id);

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
      className={`button button-secondary ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {isLoading ? "Moving..." : "Move to Pending"}
    </button>
  );
}