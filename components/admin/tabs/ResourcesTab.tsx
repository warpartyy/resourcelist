"use client";

import { useEffect, useState } from "react";
import ResourcesPanel from "../ResourcesPanel";
import { fetchResourcesByStatus } from "@/lib/services/adminService";

type Props = {
  adminSection: "resources" | "deleted";
  CATEGORY_OPTIONS: any[];
  COUNTY_OPTIONS: string[];
  sortOrder: "az" | "za" | "newest" | "oldest";
  setSortOrder: (value: "az" | "za" | "newest" | "oldest") => void;
  onSuccess?: () => void;
};

export default function ResourcesTab({
  adminSection,
  CATEGORY_OPTIONS,
  COUNTY_OPTIONS,
  sortOrder,
  setSortOrder,
  onSuccess,
}: Props) {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);

    const status =
      adminSection === "deleted" ? "deleted" : "approved";

    const data = await fetchResourcesByStatus(status);
    setResources(data || []);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [adminSection]);

  // 🔁 keeps behavior consistent with other tabs
  const handleSuccess = async () => {
    await loadData();
    onSuccess?.();
  };

  const isDeleted = adminSection === "deleted";

  if (loading) {
    return (
      <div className="text-sm text-text-muted">
        {isDeleted ? "Loading deleted resources..." : "Loading resources..."}
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
    />
  );
}