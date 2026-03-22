"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import SubmissionsPanel from "../../components/admin/SubmissionsPanel";
import ResourcesPanel from "../../components/admin/ResourcesPanel";
import AdminLayout from "../../components/admin/AdminLayout";

import {
  fetchSubmissionsByStatus,
  fetchAdminCounts,
  fetchResourcesByStatus,
} from "@/lib/services/adminService";
import { COUNTY_OPTIONS_BY_STATE } from "@/lib/geography/counties";

const CATEGORY_OPTIONS = [
  { label: "Mental Health", value: "mental-health" },
  { label: "Substance Use", value: "substance-use" },
  { label: "Food Assistance", value: "food-assistance" },
  { label: "Housing Support", value: "housing-support" },
  { label: "Transportation Services", value: "transportation-services" },
  { label: "Employment Services", value: "employment-services" },
];

const COUNTY_OPTIONS = COUNTY_OPTIONS_BY_STATE["OK"] ?? [];

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    "pending" | "rejected" | "resources" | "deleted"
  >("pending");


  const handleLogout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const supabase = getSupabase();
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      router.push("/login");
      return;
    }

    await fetchCounts();
    fetchData();
  };

  const refreshAll = async () => {
  await fetchCounts();
  await fetchData();
};

 const fetchCounts = async () => {
  const counts = await fetchAdminCounts();
  setCounts(counts);
};

const fetchData = async () => {
  setLoading(true);

  if (adminSection === "resources") {
    const data = await fetchResourcesByStatus("approved");
    setResources(data);
  } else if (adminSection === "deleted") {
    const data = await fetchResourcesByStatus("deleted");
    setResources(data);
  } else {
    const data = await fetchSubmissionsByStatus(adminSection);
    setSubmissions(data);
  }

  setLoading(false);
};

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
    >
      {adminSection === "resources" || adminSection === "deleted" ? (
  <ResourcesPanel
    resources={resources}
    fetchData={fetchData}
    CATEGORY_OPTIONS={CATEGORY_OPTIONS}
    COUNTY_OPTIONS={COUNTY_OPTIONS}
    sortOrder={resourceSortOrder}
    setSortOrder={setResourceSortOrder}
  />
) : (
<SubmissionsPanel
  submissions={submissions}
  section={adminSection}
  editingId={editingId}
  setEditingId={setEditingId}
  editedSubmission={editedSubmission}
  setEditedSubmission={setEditedSubmission}
  CATEGORY_OPTIONS={CATEGORY_OPTIONS}
  COUNTY_OPTIONS={COUNTY_OPTIONS}
  onSuccess={refreshAll}
/>
)}
    </AdminLayout>
  );
}
