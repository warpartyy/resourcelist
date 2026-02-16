"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import ResourceEditForm from "../../components/admin/ResourceEditForm";
import SubmissionCard from "../../components/admin/SubmissionCard";
import SubmissionsPanel from "../../components/admin/SubmissionsPanel";
import ResourcesPanel from "../../components/admin/ResourcesPanel";
import AdminLayout from "../../components/admin/AdminLayout";
import {getSubmissions, rejectSubmission, approveSubmissionRecord,} from "@/lib/services/submissionService";
import {approveResource, updateResource,} from "@/lib/services/resourceService";


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
  // Add more as needed
];



export default function AdminPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  fetchData();
};




const fetchData = async () => {
  const supabase = getSupabase(); // 👈 add this
  setLoading(true);

  if (adminSection === "resources") {
    const { data } = await supabase
      .from("resources")
      .select("*");

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







useEffect(() => {
  fetchData();
}, [adminSection]);



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
  fetchData();
};





const handleRejectSubmission = async (id: string) => {
  const { error } = await rejectSubmission(id);

  if (error) {
    alert("Reject failed.");
    return;
  }

  fetchData();
};





return (
  <AdminLayout
    adminSection={adminSection}
    setAdminSection={setAdminSection}
    onLogout={handleLogout}
  >
    {adminSection === "resources" ? (
      <ResourcesPanel
        resources={resources}
        fetchData={fetchData}
        CATEGORY_OPTIONS={CATEGORY_OPTIONS}
        COUNTY_OPTIONS={COUNTY_OPTIONS}
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
