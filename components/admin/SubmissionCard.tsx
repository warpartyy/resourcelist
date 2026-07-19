"use client";

import ResourceEditForm from "./ResourceEditForm";
import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import CommentsPreview from "@/components/admin/resource-edit/CommentsPreview";
import { EditableLocation } from "@/lib/types/location";
import ContactInfoSection from "@/components/admin/submissions/ContactInfoSection";
import SubmissionDetailsSection from "@/components/admin/submissions/SubmissionDetailsSection";
import MissingFieldsAlert from "@/components/admin/submissions/MissingFieldsAlert";
import DuplicateMatchesPanel from "@/components/admin/submissions/DuplicateMatchesPanel";
import SubmissionActions from "@/components/admin/submissions/SubmissionActions";
import CommentsSection from "@/components/admin/CommentsSection";
import { useAdminStore } from "@/lib/stores/adminStore";

type Props = {
  submission: any;
  section: "pending" | "approved" | "rejected";
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
  CATEGORY_OPTIONS: any[];
  COUNTY_OPTIONS: string[];
  onSuccess: () => void;
  user: any;
  highlightedCommentId?: string | null;
};

function getEditorDisplayName(submission: any) {
  return submission.last_edited_name || "Unknown admin";
}


function formatAdminTimestamp(value?: string | null) {
  if (!value) return "Unknown time";

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getMissingFields(submission: any): string[] {
  const missing: string[] = [];

  const isEmptyString = (value: unknown) =>
    typeof value !== "string" || value.trim() === "";

  const isEmptyArray = (value: unknown) =>
    !Array.isArray(value) || value.length === 0;

  if (isEmptyString(submission.organization)) missing.push("Organization");
  if (isEmptyArray(submission.subcategories)) missing.push("Subcategories");
  if (isEmptyArray(submission.counties_served)) missing.push("Counties served");

  if (isEmptyString(submission.phone)) missing.push("Phone");
  if (isEmptyString(submission.email)) missing.push("Email");
  if (isEmptyString(submission.website)) missing.push("Website");

  if (isEmptyString(submission.address)) missing.push("Address");
  if (isEmptyString(submission.city)) missing.push("City");
  if (isEmptyString(submission.state)) missing.push("State");
  if (isEmptyString(submission.zip)) missing.push("ZIP");

  if (isEmptyString(submission.description)) missing.push("Description");
  if (isEmptyArray(submission.services)) missing.push("Services");
  if (isEmptyString(submission.eligibility)) missing.push("Eligibility");

  if (submission.is_tribal && isEmptyString(submission.tribe)) {
    missing.push("Tribe");
  }

  return missing;
}

function normalizeOrgName(name: string = "") {
  return name
    .toLowerCase()
    .replace(/behavioral health|services|outpatient|clinic|center|office|mat|program|unit/gi, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

export default function SubmissionCard({
  submission,
  section,
  editedSubmission,
  setEditedSubmission,
  CATEGORY_OPTIONS,
  COUNTY_OPTIONS,
  onSuccess,
  highlightedCommentId,
  user,
}: Props) {
  const { editingId, setEditingId } = useAdminStore();
  const isActiveResource = editingId === submission.id;
  const isEditing =
  section === "pending" && editingId === submission.id;


const [additionalLocations, setAdditionalLocations] = useState<EditableLocation[]>([
  {
    address: "",
    city: "",
    state: "OK",
    zip: "",
    is_primary: false,
    location_name: "",
    phone: "",
    email: "",
  }
]);

const [possibleMatches, setPossibleMatches] = useState<any[]>([]);

useEffect(() => {
  if (editingId === submission.id) {
    setEditedSubmission(submission);
  }
}, [editingId, submission, setEditedSubmission]);


useEffect(() => {
  const runMatchCheck = async () => {
    const supabase = getSupabase();

    const normalized = normalizeOrgName(submission.organization || "").trim();

    // ❌ stop weak matches f
    if (!normalized || normalized.length < 3) {
      setPossibleMatches([]);
      return;
    }

    // 🔍 SIMPLE query (no nested locations)
    const { data: matches } = await supabase
      .from("resources")
      .select("id, organization, address, city, state")
      .neq("id", submission.id)
      .in("status", ["approved", "pending"]);

    const filteredMatches = (matches || []).filter((match) => {
      const normalizedMatch = normalizeOrgName(match.organization || "").trim();

      if (!normalizedMatch) return false;

      // ✅ ONLY name comparison
      const isNameMatch =
        normalizedMatch.includes(normalized) ||
        normalized.includes(normalizedMatch);

      if (!isNameMatch) return false;

      return true;
    });

    setPossibleMatches(filteredMatches);
  };

  runMatchCheck();
}, [submission]);

  const missingFields = getMissingFields(submission);
  
 return (
  <div
    data-resource-card-id={submission.id}
    className={`p-4 md:p-6 rounded-xl mb-4 md:mb-6 shadow-sm transition-colors duration-300 ${
      isActiveResource
        ? "bg-green-50 border-green-200 border-l-4 border-l-green-500"
        : "bg-surface border border-border"
    }`}
  >

    {isActiveResource && (
      <div className="mb-3">
        <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
          Currently Editing
        </span>
      </div>
    )}

    {/* TOP ROW (ALWAYS VISIBLE) */}
    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3 gap-3">

      {/* LEFT SIDE */}
      <div className="flex-1 pr-4">
        <h2 className="text-lg font-semibold">
          {submission.organization}
        </h2>
      </div>
      {/* RIGHT SIDE (BUTTONS + STATUS) */}
      <div className="w-full md:w-auto flex flex-col md:items-end gap-2">
        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">

<div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
  <SubmissionActions
    submission={submission}
    section={section}
    isEditing={isEditing}
    setEditedSubmission={setEditedSubmission}
    additionalLocations={additionalLocations}
    setAdditionalLocations={setAdditionalLocations}
    editedSubmission={editedSubmission}
    onSuccess={onSuccess}
  />
</div>

        </div>
      </div>
    </div>
    
    {/* CONTENT SWITCH */}
    {isEditing ? (
<ResourceEditForm
  editedSubmission={editedSubmission}
  setEditedSubmission={setEditedSubmission}
  additionalLocations={additionalLocations}
  setAdditionalLocations={setAdditionalLocations}
        CATEGORY_OPTIONS={CATEGORY_OPTIONS}
        COUNTY_OPTIONS={COUNTY_OPTIONS}
        onCancel={() => setEditingId(null)}
        user={user}
        highlightedCommentId={highlightedCommentId}
        submissionStatus={submission.status} 
      />
    ) : (
      <>

        <ContactInfoSection submission={submission} />

        <SubmissionDetailsSection submission={submission} />
        <MissingFieldsAlert
          missingFields={missingFields}
          section={section}
        />
        <DuplicateMatchesPanel
          section={section}
          possibleMatches={possibleMatches}
          submission={submission}
          setPossibleMatches={setPossibleMatches}
          onSuccess={onSuccess}
        />

{/* Admin Notes */}
{submission.admin_notes?.trim() && (
  <div className="mt-4 p-3 bg-bg border border-border rounded-md">
    <div className="text-xs text-text-subtle mb-1">
      Admin Notes
    </div>

    <div className="text-sm text-text-muted">
      {submission.admin_notes}
    </div>

    {submission.last_edited_at && (
      <div className="text-xs text-text-subtle mt-2">
        Last edited by {getEditorDisplayName(submission)} on{" "}
        {formatAdminTimestamp(submission.last_edited_at)}
      </div>
    )}
  </div>
)}

<CommentsPreview
  resourceId={submission.id}
/>

{section !== "pending" && editingId === submission.id && (
  <CommentsSection
    resourceId={submission.id}
    user={user}
    highlightedCommentId={highlightedCommentId}
    status={submission.status}
  />
)}
        
      </>
    )}
  </div>
);
}