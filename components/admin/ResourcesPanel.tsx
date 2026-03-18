/**
 * ========================================
 * RESOURCES PANEL (ADMIN) Already approved.
 * ========================================
 * 
 * Handles:
 * - Displaying resources
 * - Editing resources
 * - Soft delete / restore / hard delete
 * 
 * Key Actions:
 * - Update → updateResource()
 * - Delete → softDeleteResource()
 * 
 * Notes:
 * - Uses ResourceEditForm for editing
 * - Filtering is client-side
 * ========================================
 */
"use client";

import { useState } from "react";
import ResourceEditForm from "./ResourceEditForm";
import {
  updateResource,
  softDeleteResource,
  restoreResource,
  hardDeleteResource,
} from "@/lib/services/resourceService";



type Props = {
  resources: any[];
  fetchData: () => void;
  CATEGORY_OPTIONS: any[];
  COUNTY_OPTIONS: string[];
  sortOrder: "az" | "za" | "newest" | "oldest";
  setSortOrder: (value: "az" | "za" | "newest" | "oldest") => void;
};

export default function ResourcesPanel({
  resources,
  fetchData,
  CATEGORY_OPTIONS,
  COUNTY_OPTIONS,
  sortOrder,
  setSortOrder,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedResource, setEditedResource] = useState<any>({});
  const [search, setSearch] = useState("");



  // Sort A-Z
const filteredResources = resources
  .filter((resource) =>
    resource.organization
      ?.toLowerCase()
      .includes(search.toLowerCase())
  )
  .sort((a, b) => {
    const nameA = a.organization || "";
    const nameB = b.organization || "";

    if (sortOrder === "az") return nameA.localeCompare(nameB);
    if (sortOrder === "za") return nameB.localeCompare(nameA);

    if (sortOrder === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }

    if (sortOrder === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }

    return 0;
  });

  return (
    <>
      {/* Search + Sort Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by organization name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-bg border border-border text-text-primary placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-accent/40"
        />

        <select
          value={sortOrder}
          onChange={(e) =>
            setSortOrder(
              e.target.value as "az" | "za" | "newest" | "oldest"
            )
          }
          className={`px-4 py-2 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-blue-600 ${
            sortOrder === "az"
              ? "text-text-subtle"
              : "text-text-primary"
          }`}
        >
          <option value="az">A–Z</option>
          <option value="za">Z–A</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

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
                CATEGORY_OPTIONS={CATEGORY_OPTIONS}
                COUNTY_OPTIONS={COUNTY_OPTIONS}
                onCancel={() => setEditingId(null)}
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

                  <span className="text-xs px-2 py-1 rounded-full bg-accent/15 text-accent">
                    Active
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
        const { error } = await updateResource(
          resource.id,
          editedResource
        );

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
  <div className="flex justify-end gap-3 pt-3 border-t border-border">
    {isDeleted ? (
      <>
        <button
          onClick={async () => {
            await restoreResource(resource.id);
            fetchData();
          }}
          className="button button-secondary"
        >
          Restore
        </button>

        <button
          onClick={async () => {
            const confirmDelete = confirm(
              "Permanently delete this resource?"
            );
            if (!confirmDelete) return;

            await hardDeleteResource(resource.id);
            fetchData();
          }}
          className="px-3 py-1.5 rounded-md text-sm border border-red-500 text-red-500 hover:bg-red-500 hover:text-white hover:text-text-primary transition"
        >
          Permanently Delete
        </button>
      </>
    ) : (
      <>
        <button
          onClick={() => {
            setEditingId(resource.id);
            setEditedResource(resource);
          }}
          className="px-3 py-1.5 rounded-md text-sm font-medium bg-bg border border-border hover:bg-surface transition"
        >
          Edit
        </button>

        <button
          onClick={async () => {
            const confirmDelete = confirm(
              "Move this resource to Deleted?"
            );
            if (!confirmDelete) return;

            await softDeleteResource(resource.id);
            fetchData();
          }}
          className="px-3 py-1.5 rounded-md text-sm font-medium border border-red-500 text-red-500 hover:bg-red-500 hover:text-white hover:text-text-primary transition"
        >
          Delete
        </button>
      </>
    )}
  </div>
)}


          </div>
        );
      })
    )}
  </>
  );
}
