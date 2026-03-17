"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import SubmissionsPanel from "../../components/admin/SubmissionsPanel";
import ResourcesPanel from "../../components/admin/ResourcesPanel";
import AdminLayout from "../../components/admin/AdminLayout";
import {rejectSubmission, approveSubmissionRecord,} from "@/lib/services/submissionService";
import {approveResource,} from "@/lib/services/resourceService";
import { updateSubmissionRecord } from "@/lib/services/submissionService";
import {
  fetchSubmissionsByStatus,
  filterApprovedSubmissions,
  fetchAdminCounts,
  fetchResourcesByStatus,
} from "@/lib/services/adminService";


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
	"Alfalfa",
	"Atoka",
	"Beaver",
	"Beckham",
	"Blaine",
	"Bryan",
	"Caddo",
	"Canadian",
	"Carter",
	"Cherokee",
	"Choctaw",
	"Cimarron",
	"Cleveland",
	"Coal",
	"Comanche",
	"Cotton",
	"Craig",
	"Creek",
	"Custer",
	"Delaware",
	"Dewey",
	"Ellis",
	"Garfield",
	"Garvin",
	"Grady",
	"Grant",
	"Greer",
	"Harmon",
	"Harper",
	"Haskell",
	"Hughes",
	"Jackson",
	"Jefferson",
	"Johnston",
	"Kay",
	"Kingfisher",
	"Kiowa",
	"Latimer",
	"LeFlore",
	"Lincoln",
	"Logan",
	"Love",
	"Major",
	"Marshall",
	"Mayes",
	"McClain",
	"McCurtain",
	"McIntosh",
	"Murray",
	"Muskogee",
	"Noble",
	"Nowata",
	"Okfuskee",
	"Oklahoma",
	"Okmulgee",
	"Osage",
	"Ottawa",
	"Pawnee",
	"Payne",
	"Pittsburg",
	"Pontotoc",
	"Pottawatomie",
	"Pushmataha",
	"Roger Mills",
	"Rogers",
	"Seminole",
	"Sequoyah",
	"Stephens",
	"Texas",
	"Tillman",
	"Tulsa",
	"Wagoner",
	"Washington",
	"Washita",
	"Woods",
	"Woodward",
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
  deleted: 0,
});


  // ✅ NEW: sort state (DB-level)
  const [resourceSortOrder, setResourceSortOrder] =
  useState<"default" | "newest" | "oldest">("default");

  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedSubmission, setEditedSubmission] = useState<any>({});
  const [adminSection, setAdminSection] = useState<
    "pending" | "approved" | "rejected" | "resources" | "deleted"
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

 const fetchCounts = async () => {
  const counts = await fetchAdminCounts();
  setCounts(counts);
};

const fetchData = async () => {
  setLoading(true);

  if (adminSection === "resources") {
    const data = await fetchResourcesByStatus("active");
    setResources(data);

  } else if (adminSection === "deleted") {
    const data = await fetchResourcesByStatus("deleted");
    setResources(data);

  } else if (adminSection === "approved") {
    const data = await filterApprovedSubmissions();
    setSubmissions(data);

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

  const saveSubmission = async (submission: any) => {
  const finalData =
    editingId === submission.id
      ? editedSubmission
      : submission;

  const { error } = await updateSubmissionRecord(
    submission.id,
    finalData
  );

  if (error) {
    alert("Save failed.");
    return;
  }

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
    onSave={saveSubmission}  
    onApprove={approveSubmission}
    onReject={handleRejectSubmission}
  />
)}

    </AdminLayout>
  );
}
