"use client";

import ResourceEditForm from "./ResourceEditForm";
import SaveButton from "./actions/SaveButton";
import MoveSubmissionToPendingButton from "./actions/MoveToPendingButton";
import ApproveButton from "./actions/ApproveButton";
import DeleteButton from "./actions/DeleteButton";
import RejectButton from "./actions/RejectButton";
import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import CommentsPreview from "@/components/admin/resource-edit/CommentsPreview";
import { EditableLocation } from "@/lib/types/location";


type Props = {
  submission: any;
  section: "pending" | "approved" | "rejected";
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
  CATEGORY_OPTIONS: any[];
  COUNTY_OPTIONS: string[];
  onSuccess: () => void;
  user: any;
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

export default function SubmissionCard({
  submission,
  section,
  editingId,
  setEditingId,
  editedSubmission,
  setEditedSubmission,
  CATEGORY_OPTIONS,
  COUNTY_OPTIONS,
  onSuccess,
  user,
}: Props) {
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

function normalizeOrgName(name: string = "") {
  return name
    .toLowerCase()
    .replace(/behavioral health|services|outpatient|clinic|center|office|mat|program|unit/gi, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}
  
 return (
  <div className="bg-surface border border-border p-4 md:p-6 rounded-xl mb-4 md:mb-6 shadow-sm">

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
{!isEditing ? (
  <>
    {section === "pending" && (
      <>
        <button

onClick={async () => {
  const supabase = getSupabase();

  setEditingId(submission.id);
  setEditedSubmission(submission);

  // 🔍 Fetch locations (your existing logic)
  const { data: locations, error } = await supabase
    .from("resource_locations")
    .select("*")
    .eq("resource_id", submission.id);

  if (error) {
    console.error(error);
    setAdditionalLocations([]);
    return;
  }

const additional = (locations || [])
  .filter((loc) => !loc.is_primary)
  .map((loc) => ({
    address: loc.address || "",
    city: loc.city || "",
    state: loc.state || "OK",
    zip: loc.zip || "",
    is_primary: false,
    location_name: loc.location_name || "",
    phone: loc.phone || "",
    email: loc.email || "",
  }));

  setAdditionalLocations(
    additional.length > 0
      ? additional
: [{
  address: "",
  city: "",
  state: "OK",
  zip: "",
  is_primary: false,
  location_name: "",
  phone: "",   // ✅ ADD
  email: "",   // ✅ ADD (optional but consistent)
}]
  );
}}
          className="w-full md:w-auto px-4 py-2 rounded-md text-sm font-medium bg-bg border border-border hover:bg-surface transition"
        >
          Edit
        </button>
<ApproveButton
  resource={submission}
  onSuccess={() => {
    setEditingId(null);
    onSuccess();
  }}
/>

<RejectButton
  resource={submission}
  onSuccess={() => {
    onSuccess();
  }}
/>
      </>
    )}

    {section === "rejected" && (
      <>
        <MoveSubmissionToPendingButton
          submission={submission}
          onSuccess={() => {
            setEditingId(null);
            onSuccess();
          }}
        />

<DeleteButton
  resource={submission}
  onSuccess={() => {
    setEditingId(null);
    onSuccess();
  }}
/>
      </>
    )}

    {section === "approved" && null}
  </>
) : (
<>
<SaveButton
  resourceId={submission.id}
  editedData={editedSubmission}
  additionalLocations={additionalLocations}
  onSuccess={() => {
    setEditingId(null);
    onSuccess();
  }}
/>

<ApproveButton
  resource={submission}
  editedData={editedSubmission}
  isEditing={true}
  onSuccess={() => {
    setEditingId(null);
    onSuccess();
  }}
/>

  <button
    onClick={() => setEditingId(null)}
    className="w-full md:w-auto px-4 py-2 rounded-md text-sm font-medium border border-border text-text-muted hover:bg-bg transition"
  >
    Cancel
  </button>
</>
          )}
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
      />
    ) : (
      <>
        {/* Contact Info */}
        <div className="text-sm text-text-muted mt-2 space-y-1">
          {submission.address && (
            <div>
              <span className="text-text-subtle">Address:</span>{" "}
              {submission.address}
              {submission.city && `, ${submission.city}`}
              {submission.state && `, ${submission.state}`}
              {submission.zip && ` ${submission.zip}`}
            </div>
          )}

          {submission.email && (
            <div>
              <span className="text-text-subtle">Email:</span>{" "}
              {submission.email}
            </div>
          )}

          {submission.phone && (
            <div>
              <span className="text-text-subtle">Phone:</span>{" "}
              {submission.phone}
            </div>
          )}
        </div>

        {/* Description */}
        {submission.description && (
          <p className="text-text-muted text-sm mt-4">
            {submission.description}
          </p>
        )}

        {/* Metadata Row */}
        <div className="flex flex-wrap gap-6 text-sm text-text-muted mt-4">
          {submission.counties_served?.length > 0 && (
            <span>
              <span className="text-text-subtle">Counties:</span>{" "}
              {submission.counties_served.join(", ")}
            </span>
          )}

          {submission.parent_categories?.length > 0 && (
            <span>
              <span className="text-text-subtle">Category:</span>{" "}
              {submission.parent_categories.join(", ")}
            </span>
          )}

          {submission.created_at && (
            <span>
              <span className="text-text-subtle">Submitted:</span>{" "}
              {new Date(submission.created_at).toLocaleDateString()}
            </span>
          )}
        </div>









        {/* Missing Fields (Admin helper) */}
{section === "pending" && missingFields.length > 0 && (
  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
    <div className="text-xs font-medium text-amber-700">
      Missing information
    </div>
    <div className="text-xs text-amber-800 mt-1">
      {missingFields.join(" • ")}
    </div>
  </div>
)}

{/* ✅ Duplicate Warning */}
{section === "pending" && possibleMatches.length > 0 && (
  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
    <div className="text-xs font-medium text-blue-700">
      Possible duplicate or existing organization
    </div>

    <div className="text-xs text-blue-800 mt-1">
      This submission may belong to an existing organization.
      Review carefully before creating a new resource.
    </div>

    <div className="mt-2 space-y-2">
      {possibleMatches.map((match) => (
        <div
          key={match.id}
          className="flex justify-between items-center text-sm"
        >
          <div>
            <div className="font-medium text-blue-900">
              {match.organization}
            </div>
            <div className="text-xs text-blue-700">
              <div className="text-xs mt-1">

{match.address &&
 submission.address &&
 match.address.toLowerCase().trim() === submission.address.toLowerCase().trim() &&
 match.city?.toLowerCase().trim() === submission.city?.toLowerCase().trim() ? (
    
    <span className="text-red-600">
      ⚠️ Exact duplicate (same address)
    </span>
  ) : (
    <span className="text-blue-700">
      📍 Same organization, different location ({match.city}, {match.state})
    </span>
  )}
</div>
            </div>
          </div>




          <button
onClick={async () => {
  const supabase = getSupabase(); // ✅ ALWAYS FIRST

  // 🔍 1. Get existing resource
  const { data: existingResource } = await supabase
    .from("resources")
    .select("subcategories, tags, parent_categories")
    .eq("id", match.id)
    .single();

  // 🧠 2. Merge data


const mergedSubcategories = Array.from(new Set([
  ...(existingResource?.subcategories || []),
  ...(Array.isArray(submission.subcategories) ? submission.subcategories : []),
]));

const mergedTags = Array.from(new Set([
  ...(existingResource?.tags || []),
  ...(Array.isArray(submission.tags) ? submission.tags : []),
]));

const mergedParentCategories = Array.from(new Set([
  ...(existingResource?.parent_categories || []),
  ...(Array.isArray(submission.parent_categories) ? submission.parent_categories : []),
]));

  // ✅ 3. Update parent resource FIRST
  await supabase
    .from("resources")
    .update({
      subcategories: mergedSubcategories,
      tags: mergedTags,
      parent_categories: mergedParentCategories,
    })
    .eq("id", match.id);

  // 📍 4. Insert location
  const { error } = await supabase
    .from("resource_locations")
    .insert({
      resource_id: match.id,
      address: submission.address,
      city: submission.city,
      state: submission.state,
      zip: submission.zip,
      is_primary: false,
      location_name: submission.organization || null,
    });

  if (error) {
    console.error(error);
    alert("Failed to attach location");
    return;
  }

  // 🗑️ 5. Remove submission
await supabase
  .from("resources")
  .delete()
  .eq("id", submission.id);

  // 🔄 6. Refresh UI
  setPossibleMatches([]);
  setEditingId(null);
  onSuccess();
}}

            className="text-xs text-blue-600 hover:underline"
          >
            Attach as location
          </button>






        </div>
      ))}
    </div>
  </div>
)}




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

<CommentsPreview resourceId={submission.id} />
        
      </>
    )}
  </div>
);
}