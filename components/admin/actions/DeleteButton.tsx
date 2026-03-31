"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  hardDeleteResource,
} from "@/lib/services/resourceService";
import { getSupabase } from "@/lib/supabase";

type Props = {
  resource: any;
// removed variant — all deletes are permanent
  onSuccess?: () => void;
};

export default function DeleteButton({
  resource,
  // no variant — always permanent delete
  onSuccess,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);



const handleDelete = async () => {
  if (isLoading) return;

  const confirmDelete = confirm(
    "Permanently delete this resource? This cannot be undone."
  );
  if (!confirmDelete) return;

  setIsLoading(true);

  try {
    const { error } = await hardDeleteResource(resource.id);

    if (error) {
      console.error(error);
      toast.error("Delete failed.");
      return;
    }

    toast.success("Resource permanently deleted");
    onSuccess?.();
  } finally {
    setIsLoading(false);
  }
};

  return (
    <button
      onClick={handleDelete}
      disabled={isLoading}
      className={`button button-danger ${
        isLoading ? "button-disabled" : ""
      }`}
    >
{isLoading ? "Deleting..." : "Delete Permanently"}
    </button>
    );
}