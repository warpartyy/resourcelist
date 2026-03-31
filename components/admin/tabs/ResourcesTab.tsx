"use client";

import { useEffect, useState } from "react";
import ResourcesPanel from "../ResourcesPanel";
import { fetchResourcesByStatus } from "@/lib/services/adminService";

type Props = {
  adminSection: "resources";
  CATEGORY_OPTIONS: any[];
  COUNTY_OPTIONS: string[];
  sortOrder: "az" | "za" | "newest" | "oldest";
  setSortOrder: (value: "az" | "za" | "newest" | "oldest") => void;
  onSuccess?: () => void;
  search: string;
};

export default function ResourcesTab({
  adminSection,
  CATEGORY_OPTIONS,
  COUNTY_OPTIONS,
  sortOrder,
  setSortOrder,
  onSuccess,
  search,
}: Props) {
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
    />
  );
}