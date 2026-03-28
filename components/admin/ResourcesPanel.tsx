"use client";
import { useState, useEffect } from "react";
import ResourceEditForm from "./ResourceEditForm";
import {
  updateResource,
  softDeleteResource,
  restoreResource,
  hardDeleteResource,
} from "@/lib/services/resourceService";
import AdminActionButtons from "./AdminActionButtons";
import ApproveButton from "./actions/ApproveButton";
import RejectButton from "./actions/RejectButton";
import DeleteButton from "./actions/DeleteButton";
import RestoreButton from "./actions/RestoreButton";
import { moveResourceToPending } from "@/lib/services/resourceService";
import MoveSubmissionToPendingButton from "./actions/MoveToPendingButton";
import { getSupabase } from "@/lib/supabase";
import { ResourceLocation } from "@/lib/resources/getPrimaryLocation";

type Props = {
  resources: any[];
  fetchData: () => void;
  CATEGORY_OPTIONS: any[];
  COUNTY_OPTIONS: string[];
  sortOrder: "az" | "za" | "newest" | "oldest";
  setSortOrder: (value: "az" | "za" | "newest" | "oldest") => void;
  search: string;
};

export default function ResourcesPanel({
  resources,
  fetchData,
  CATEGORY_OPTIONS,
  COUNTY_OPTIONS,
  sortOrder,
  setSortOrder,
  search,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedResource, setEditedResource] = useState<any>({});
  const [user, setUser] = useState<any>(null);
  const [additionalLocations, setAdditionalLocations] = useState([
  { address: "", city: "", state: "OK", zip: "", is_primary: false }
]);

useEffect(() => {
  const fetchUser = async () => {
    const supabase = getSupabase();
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };

  fetchUser();
}, []);

  // Sort A-Z
console.log("SORT ORDER:", sortOrder);

const filteredResources = [...resources] // ✅ IMPORTANT
  .filter((resource) => {
    const searchText = (search || "").toLowerCase();

    const combined = [
      resource.organization,
      resource.city,
      resource.services,
      resource.description,
      resource.eligibility,
      resource.counties_served,
      ...(Array.isArray(resource.tags) ? resource.tags : []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return combined.includes(searchText);
  })
  .sort((a, b) => {
    const nameA = a.organization || "";
    const nameB = b.organization || "";

    if (sortOrder === "az") return nameA.localeCompare(nameB);
    if (sortOrder === "za") return nameB.localeCompare(nameA);

    if (sortOrder === "newest") {
      return (
        new Date(b.submitted_at || 0).getTime() -
        new Date(a.submitted_at || 0).getTime()
      );
    }

    if (sortOrder === "oldest") {
      return (
        new Date(a.submitted_at || 0).getTime() -
        new Date(b.submitted_at || 0).getTime()
      );
    }

    return 0;
  });





  return (
    <>
      
      {filteredResources.length === 0 ? (
  <div className="text-text-muted">
    No matching resources found.
  </div>
) : (
  filteredResources.map((resource) => {
          const isEditing = editingId === resource.id;
          const isDeleted = resource.status === "deleted";
          
          return (
            <div
              key={resource.id}
              className="bg-surface border border-border p-6 rounded-xl mb-6"
            >

            {isEditing ? (
<ResourceEditForm
  editedSubmission={editedResource}
  setEditedSubmission={setEditedResource}
  additionalLocations={additionalLocations}
  setAdditionalLocations={setAdditionalLocations}
                CATEGORY_OPTIONS={CATEGORY_OPTIONS}
                COUNTY_OPTIONS={COUNTY_OPTIONS}
                onCancel={() => setEditingId(null)}
                user={user}
              />
            ) : (
              <>
                {/* Top Row */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {resource.organization}
                    </h2>

                    <p className="text-text-muted text-sm mt-1 line-clamp-2">
                      {resource.description}
                    </p>
                  </div>

                  <span className={`text-xs px-2 py-1 rounded-full ${
resource.status === "approved"
  ? "bg-green-100 text-green-700"
    : resource.status === "rejected"
    ? "bg-yellow-100 text-yellow-700"
    : resource.status === "deleted"
    ? "bg-red-100 text-red-700"
    : "bg-gray-100 text-gray-600"
}`}>
{resource.status === "approved" ? "Approved" : resource.status}
</span>
                </div>

                {/* Metadata Row */}
                <div className="flex flex-wrap gap-6 text-sm text-text-muted mb-4">
                  {resource.address && (
                    <span>
                      <span className="text-text-subtle">
                        Address:
                        </span>{" "}
                        {resource.address}
                        {resource.city && `, ${resource.city}`}
                        {resource.state && `, ${resource.state}`}
                        {resource.zip && ` ${resource.zip}`}
                        </span>
                    )}

                  {resource.parent_categories?.length > 0 && (
                    <span>
                      <span className="text-text-subtle">
                        Category:
                      </span>{" "}
                      {resource.parent_categories.join(", ")}
                    </span>
                  )}

                  {resource.last_verified && (
                    <span>
                      <span className="text-text-subtle">
                        Verified:
                      </span>{" "}
                      {new Date(
                        resource.last_verified
                      ).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </>
            )}


            {/* Actions */}
{isEditing ? (
  <div className="flex justify-end gap-3 pt-3 border-t border-border">
    <button
      onClick={() => setEditingId(null)}
      className="px-3 py-1.5 rounded-md text-sm font-medium bg-bg border border-border hover:bg-surface transition"
    >
      Cancel
    </button>

    <button

onClick={async () => {
  const supabase = getSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("User not found");
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email")
    .eq("id", user.id)
    .single();

  const { error } = await updateResource(resource.id, {
    ...editedResource,
    last_edited_by: user.id,
    last_edited_email: user.email,
    last_edited_name: profile?.display_name || user.email,
    last_edited_at: new Date().toISOString(),
  });


        if (error) {
          alert("Update failed.");
          return;
        }

        setEditingId(null);
        fetchData();
      }}
      className="button button-secondary"
    >
      Update
    </button>
  </div>
) : (

  <div className="flex justify-between items-center pt-3 border-t border-border">

  {/* Left side: Edit */}
  <button
onClick={async () => {
  setEditingId(resource.id);
  setEditedResource(resource);

  const supabase = getSupabase();

  const { data: locations, error } = await supabase
    .from("resource_locations")
    .select("*")
    .eq("resource_id", resource.id);

  if (error) {
    console.error(error);
    setAdditionalLocations([]);
    return;
  }

  // Remove primary location (we already use resource fields for that)
  const additional = (locations || [])
    .filter((loc) => !loc.is_primary)
.map((loc) => ({
  address: loc.address || "",
  city: loc.city || "",
  state: loc.state || "OK",
  zip: loc.zip || "",
  is_primary: false,
  location_name: loc.location_name || "", // ✅ ADD THIS
}))

  setAdditionalLocations(additional.length > 0 ? additional : [
    {
  address: "",
  city: "",
  state: "OK",
  zip: "",
  is_primary: false,
  location_name: "", // ✅ ADD THIS
}
  ]);
}}
    className="px-3 py-1.5 rounded-md text-sm font-medium bg-bg border border-border hover:bg-surface transition"
  >
    Edit
  </button>

  {/* Right side: Actions */}
  <div className="flex gap-2">



{resource.status === "approved" && (
  <>
{resource.status === "approved" && (
  <>
    <MoveSubmissionToPendingButton
      submission={resource}
      onSuccess={fetchData}
    />

    <RejectButton
      resource={resource}
      onSuccess={fetchData}
    />
  </>
)}
  </>
)}

{resource.status === "deleted" ? (
  <>
    <RestoreButton
      resource={resource}
      onSuccess={fetchData}
    />

    <DeleteButton
      resource={resource}
      variant="hard"
      onSuccess={fetchData}
    />
  </>
) : resource.status === "rejected" ? (
  <DeleteButton
    resource={resource}
    onSuccess={fetchData}
  />
) : null}


</div>
</div>
)}
          </div>
        );
      })
    )}
  </>
  );
}
