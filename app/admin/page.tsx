"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminTabs from "@/components/admin/tabs/AdminTabs";
import {fetchAdminCounts} from "@/lib/services/adminService";
import { COUNTY_OPTIONS_BY_STATE } from "@/lib/geography/counties";
import { getSupabase } from "@/lib/supabase";

const CATEGORY_OPTIONS = [
  { label: "Mental Health", value: "mental-health" },
  { label: "Substance Use", value: "substance-use" },
  { label: "Food Assistance", value: "food-assistance" },
  { label: "Housing Support", value: "housing-support" },
  { label: "Transportation Services", value: "transportation-services" },
  { label: "Employment Services", value: "employment-services" },
];

const COUNTY_OPTIONS = COUNTY_OPTIONS_BY_STATE["OK"] ?? [];

export default function AdminPage({
  displayName,
}: {
  displayName?: string | null;
}) {



  // Counts
const [counts, setCounts] = useState({
  pending: 0,
  rejected: 0,
  resources: 0,
  deleted: 0,
});

  const [resourceSortOrder, setResourceSortOrder] =
  useState<"az" | "za" | "newest" | "oldest">("az");

  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedSubmission, setEditedSubmission] = useState<any>({});
  const [adminSection, setAdminSection] = useState<
  "pending" | "rejected" | "resources" | "deleted" | "settings"
>("pending");


  const handleLogout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.push("/login");
  };




  const refreshAll = async () => {
  await fetchCounts();
  await fetchData();
};

const fetchCounts = async () => {
  try {
    const counts = await fetchAdminCounts();
    setCounts(counts);
  } catch (err) {
    console.error("Failed to fetch counts", err);
  }
};

const [search, setSearch] = useState("");

const fetchData = async () => {
};

  useEffect(() => {
  fetchCounts();
}, []);

  // ✅ UPDATED dependency
  useEffect(() => {
    fetchData();
  }, [adminSection, resourceSortOrder]);



  return (
  <AdminLayout
  adminSection={adminSection}
  setAdminSection={setAdminSection}
  onLogout={handleLogout}
  pendingCount={counts.pending}
  resourceCount={counts.resources}
  rejectedCount={counts.rejected}
  deletedCount={counts.deleted}
  search={search}
  setSearch={setSearch}
  sortOrder={resourceSortOrder}
  setSortOrder={setResourceSortOrder}
>
    <AdminTabs
      adminSection={adminSection}
      editingId={editingId}
      setEditingId={setEditingId}
      editedSubmission={editedSubmission}
      setEditedSubmission={setEditedSubmission}
      CATEGORY_OPTIONS={CATEGORY_OPTIONS}
      COUNTY_OPTIONS={COUNTY_OPTIONS}
      onSuccess={refreshAll}
      sortOrder={resourceSortOrder}
      setSortOrder={setResourceSortOrder}
      search={search}
      setSearch={setSearch}
    />
  </AdminLayout>
);
}