"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import SubmissionsPanel from "../../components/admin/SubmissionsPanel";
import ResourcesPanel from "../../components/admin/ResourcesPanel";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  rejectSubmission,
  approveSubmissionRecord,
} from "@/lib/services/submissionService";
import {
  approveResource,
} from "@/lib/services/resourceService";

const CATEGORY_OPTIONS = [
  { label: "Mental Health", value: "mental-health" },
  { label: "Substance Use", value: "substance-use" },
  { label: "Food Assistance", value: "food-assistance" },
  { label: "Housing Support", value: "housing-support" },
  { label: "Transportation Services", value: "transportation-services" },
  { label: "Employment Services", value: "employment-services" },
];

const COUNTY_OPTIONS = [
  "Adair",
  "Beckham",
  "Caddo",
  "Canadian",
  "Cleveland",
  "Comanche",
  "Cotton",
  "Grady",
  "Jackson",
  "Kiowa",
  "Stephens",
  "Tillman",
];

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Counts
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    resources: 0,
  });

  // ✅ NEW: sort state (DB-level)
  const [resourceSortOrder, setResourceSortOrder] =
  useState<"default" | "newest" | "oldest">("default");

  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedSubmission, setEditedSubmission] = useState<any>({});
  const [adminSection, setAdminSection] = useState<
    "pending" | "approved" | "rejected" | "resources"
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

  // Fetch counts
  const fetchCounts = async () => {
    const supabase = getSupabase();

    const { count: pending } = await supabase
      .from("resource_submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const { count: approved } = await supabase
      .from("resource_submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved");

    const { count: rejected } = await supabase
      .from("resource_submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "rejected");

    const { count: resources } = await supabase
      .from("resources")
      .select("*", { count: "exact", head: true });

    setCounts({
      pending: pending || 0,
      approved: approved || 0,
      rejected: rejected || 0,
      resources: resources || 0,
    });
  };

  // Fetch data (UPDATED for DB-level sorting)
  const fetchData = async () => {
    const supabase = getSupabase();
    setLoading(true);

if (adminSection === "resources") {
  let query = supabase.from("resources").select("*");

  if (resourceSortOrder === "oldest") {
    query = query.order("last_verified", { ascending: true });
  } else {
    // default + newest both use descending
    query = query.order("last_verified", { ascending: false });
  }

  const { data } = await query;
  setResources(data || []);
    } else {
      const { data } = await supabase
        .from("resource_submissions")
        .select("*")
        .eq("status", adminSection);

      setSubmissions(data || []);
    }

    setLoading(false);
  };

  // ✅ UPDATED dependency
  useEffect(() => {
    fetchData();
  }, [adminSection, resourceSortOrder]);

  const approveSubmission = async (submission: any) => {
    const finalData =
      editingId === submission.id
        ? editedSubmission
        : submission;

    const { error } = await approveResource(finalData);

    if (error) {
      alert("Save failed.");
      return;
    }

    await approveSubmissionRecord(submission.id);

    setEditingId(null);

    await fetchCounts();
    fetchData();
  };

  const handleRejectSubmission = async (id: string) => {
    const { error } = await rejectSubmission(id);

    if (error) {
      alert("Reject failed.");
      return;
    }

    await fetchCounts();
    fetchData();
  };

  return (
    <AdminLayout
      adminSection={adminSection}
      setAdminSection={setAdminSection}
      onLogout={handleLogout}
      pendingCount={counts.pending}
      resourceCount={counts.resources}
      approvedCount={counts.approved}
      rejectedCount={counts.rejected}
    >
      {adminSection === "resources" ? (
        <ResourcesPanel
          resources={resources}
          fetchData={fetchData}
          CATEGORY_OPTIONS={CATEGORY_OPTIONS}
          COUNTY_OPTIONS={COUNTY_OPTIONS}
          sortOrder={resourceSortOrder}             // ✅ NEW
          setSortOrder={setResourceSortOrder}       // ✅ NEW
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
          onApprove={approveSubmission}
          onReject={handleRejectSubmission}
        />
      )}
    </AdminLayout>
  );
}
