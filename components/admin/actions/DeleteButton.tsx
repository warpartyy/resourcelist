"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  softDeleteResource,
  hardDeleteResource,
} from "@/lib/services/resourceService";

type Props = {
  resource: any;
  variant?: "soft" | "hard";
  onSuccess?: () => void;
};

export default function DeleteButton({
  resource,
  variant = "soft",
  onSuccess,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (isLoading) return;


    if (variant === "hard") {
      const confirmDelete = confirm("Permanently delete? This cannot be undone.");
      if (!confirmDelete) return;
    }

    setIsLoading(true);

    try {
      if (variant === "soft") {
        const { error } = await softDeleteResource(resource.id);

        if (error) {
          console.error(error);
          toast.error("Delete failed.");
          return;
        }

        toast.success("Moved to deleted");
      }

      if (variant === "hard") {
        const { error } = await hardDeleteResource(resource.id);

        if (error) {
          console.error(error);
          toast.error("Permanent delete failed.");
          return;
        }

        toast.success("Permanently deleted");
      }

      onSuccess?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isLoading}
      className={`button button-danger ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {isLoading
        ? variant === "hard"
          ? "Deleting permanently..."
          : "Deleting..."
        : variant === "hard"
          ? "Delete Permanently"
          : "Delete"}
    </button>
  );
}