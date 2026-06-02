"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminTabs from "@/components/admin/tabs/AdminTabs";
import {fetchAdminCounts} from "@/lib/services/adminService";
import { COUNTY_OPTIONS_BY_STATE } from "@/lib/geography/counties";
import { getSupabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useAdminStore } from "@/lib/stores/adminStore";

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

const searchParams = useSearchParams();

  // Counts
const [counts, setCounts] = useState({
  pending: 0,
  rejected: 0,
  resources: 0,
  updateRequests: 0,
  notifications: 0,
});

  const router = useRouter();
  const rawResource = searchParams.get("resource");

const resourceFromUrl =
  rawResource && rawResource !== "null" ? rawResource : null;
  const submissionFromUrl = searchParams.get("submission");
  const [editedSubmission, setEditedSubmission] = useState<any>({});
const sectionFromUrl = searchParams.get("section");

const { 
  adminSection, 
  setAdminSection, 
  search, 
  setSearch, 
  sortOrder, 
  setSortOrder, 
  editingId, 
  setEditingId 
} = useAdminStore();

useEffect(() => {
  if (!sectionFromUrl) return;
  setAdminSection(sectionFromUrl as any);
}, [sectionFromUrl, setAdminSection]);

const { user, loading } = useCurrentUser();

  const handleLogout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.push("/login");
  };

const commentFromUrl = searchParams.get("comment");

  const refreshAll = async () => {
  await fetchCounts();
};



useEffect(() => {
  if (!resourceFromUrl) return;

  // open the resource
  setEditingId(null);

  setTimeout(() => {
    setEditingId(resourceFromUrl);
  }, 0);
}, [resourceFromUrl, setEditingId]);






const fetchCounts = async () => {
  try {
    const supabase = getSupabase(); // ✅ MOVE HERE

    const counts = await fetchAdminCounts();

    // 🔥 MERGE instead of replace
    setCounts((prev) => ({
      ...prev,
      ...counts,
    }));

    const { count: notificationCount } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("read", false);

    setCounts((prev) => ({
      ...prev,
      notifications: notificationCount || 0,
      
    }));
  } catch (err) {
    console.error("Failed to fetch counts", err);
  }
};

const decrementUpdateRequests = () => {
  setCounts((prev) => ({
    ...prev,
    updateRequests: Math.max(0, prev.updateRequests - 1),
  }))
}

  useEffect(() => {
  fetchCounts();
}, []);


  return (
  <AdminLayout
  adminSection={adminSection}
  setAdminSection={setAdminSection}
  onLogout={handleLogout}
  pendingCount={counts.pending}
  resourceCount={counts.resources}
  rejectedCount={counts.rejected}
  updateRequestsCount={counts.updateRequests}
  notificationsCount={counts.notifications}
>
    <AdminTabs
      editedSubmission={editedSubmission}
      setEditedSubmission={setEditedSubmission}
      CATEGORY_OPTIONS={CATEGORY_OPTIONS}
      COUNTY_OPTIONS={COUNTY_OPTIONS}
      onSuccess={refreshAll}
      onUpdateRequestHandled={decrementUpdateRequests}
      user={user}
      highlightedCommentId={commentFromUrl}
    />
  </AdminLayout>
);
}