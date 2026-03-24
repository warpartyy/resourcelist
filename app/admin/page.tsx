"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminTabs from "@/components/admin/tabs/AdminTabs";
import {fetchAdminCounts} from "@/lib/services/adminService";
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
  "pending" | "rejected" | "resources" | "deleted" | "settings"
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

  // 1. Check session
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    router.push("/login");
    return;
  }

  const user = sessionData.session.user;

type Profile = {
  role: string | null;
  display_name: string | null;
};

  // 2. Fetch profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<Profile>();

  if (error || !profile) {
    console.error("Profile fetch error:", error);
    router.push("/");
    return;
  }

  // 3. Check role
  if (profile.role !== "admin") {
    router.push("/");
    return;
  }

  // 🚨 Force onboarding if no display name
if (!profile.display_name) {
  router.push("/admin/settings");
  return;
}

  // ✅ Authorized
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

const [search, setSearch] = useState("");

const fetchData = async () => {
  setLoading(true);
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

  // NEW
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