"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { restoreResource } from "@/lib/services/resourceService";

type Props = {
  resource: any;
  onSuccess?: () => void;
};

export default function RestoreButton({
  resource,
  onSuccess,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRestore = async () => {
    if (isLoading) return;

    const confirmRestore = confirm("Restore this resource?");
    if (!confirmRestore) return;

    setIsLoading(true);

    try {
      const { error } = await restoreResource(resource.id);

      if (error) {
        console.error(error);
        toast.error("Restore failed.");
        return;
      }

      toast.success("Resource restored");
      onSuccess?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleRestore}
      disabled={isLoading}
      className={`button button-secondary ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {isLoading ? "Restoring..." : "Restore"}
    </button>
  );
}