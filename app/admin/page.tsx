"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import ResourceEditForm from "../../components/admin/ResourceEditForm";
import SubmissionCard from "../../components/admin/SubmissionCard";
import SubmissionsPanel from "../../components/admin/SubmissionsPanel";
import ResourcesPanel from "../../components/admin/ResourcesPanel";
import AdminLayout from "../../components/admin/AdminLayout";


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
  await supabase.auth.signOut();
  router.push("/login");
};



  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      router.push("/login");
      return;
    }

  fetchData();

  };



const fetchData = async () => {
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

// Check for duplicate (organization + address)
const { data: existing } = await supabase
  .from("resources")
  .select("id")
  .eq("organization", finalData.organization)
  .eq("address", finalData.address);

if (existing && existing.length > 0) {
  alert("A resource with this organization and address already exists.");
  return;
}


      
  const insertResponse = await supabase
    .from("resources")
    .insert([
      {
        slug: finalData.organization
          .toLowerCase()
          .replace(/\s+/g, "-"),
        organization: finalData.organization,
        categories: finalData.categories,
        counties_served: finalData.counties_served,
        phone: finalData.phone,
        website: finalData.website,
        application_link: finalData.application_link,
        address: finalData.address,
        description: finalData.description,
        services: finalData.services,
        eligibility: finalData.eligibility,
        last_verified: new Date().toISOString().split("T")[0],
      },
    ]);

  if (insertResponse.error) {
    alert("Insert failed.");
    return;
  }

  await supabase
    .from("resource_submissions")
    .update({ status: "approved" })
    .eq("id", submission.id);

  setEditingId(null);
  fetchData();

};



  const rejectSubmission = async (id: string) => {
    await supabase
      .from("resource_submissions")
      .update({ status: "rejected" })
      .eq("id", id);

    fetchData();
  };


  if (loading) return <div className="p-8">Loading...</div>;

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
        activeTab={adminSection}
        setActiveTab={setAdminSection}
        editingId={editingId}
        setEditingId={setEditingId}
        editedSubmission={editedSubmission}
        setEditedSubmission={setEditedSubmission}
        CATEGORY_OPTIONS={CATEGORY_OPTIONS}
        COUNTY_OPTIONS={COUNTY_OPTIONS}
        onApprove={approveSubmission}
        onReject={rejectSubmission}
      />
    )}
  </AdminLayout>
);










}
