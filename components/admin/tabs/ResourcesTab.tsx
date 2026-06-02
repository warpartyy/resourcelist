"use client";

import { useEffect, useState } from "react";
import ResourcesPanel from "../ResourcesPanel";
import { fetchResourcesByStatus } from "@/lib/services/adminService";
import { useAdminStore } from "@/lib/stores/adminStore";

type Props = {
  CATEGORY_OPTIONS: any[];
  COUNTY_OPTIONS: string[];
  sortOrder: "az" | "za" | "newest" | "oldest";
  setSortOrder: (value: "az" | "za" | "newest" | "oldest") => void;
  onSuccess?: () => void;
  search: string;
  editingId: string | null;
  highlightedCommentId?: string | null;
  selectedResourceId?: string | null;
};

export default function ResourcesTab({
  CATEGORY_OPTIONS,
  COUNTY_OPTIONS,
  sortOrder,
  setSortOrder,
  onSuccess,
  search,
  editingId,
  highlightedCommentId,
  selectedResourceId
}: Props) {
  const { setEditingId } = useAdminStore();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);

const status = "approved";

    const data = await fetchResourcesByStatus(status);
    setResources(data || []);

    setLoading(false);
  };


  useEffect(() => {
  if (!selectedResourceId || resources.length === 0) return;

  // 🔥 ensure edit mode triggers AFTER data loads
  setEditingId(selectedResourceId);
}, [selectedResourceId, resources, setEditingId]);



  useEffect(() => {
    loadData();
}, [sortOrder, search]);

  // 🔁 keeps behavior consistent with other tabs
  const handleSuccess = async () => {
    await loadData();
    onSuccess?.();
  };


  if (loading) {
    return (
      <div className="text-sm text-text-muted">
        Loading resources...
      </div>
    );
  }

  return (
    <ResourcesPanel
      resources={resources}
      fetchData={handleSuccess}
      CATEGORY_OPTIONS={CATEGORY_OPTIONS}
      COUNTY_OPTIONS={COUNTY_OPTIONS}
      sortOrder={sortOrder}
      setSortOrder={setSortOrder}
      search={search}
      editingId={editingId}
      highlightedCommentId={highlightedCommentId}
    />
  );
}