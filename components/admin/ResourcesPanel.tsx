"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import ResourceEditForm from "./ResourceEditForm";

type Props = {
  resources: any[];
  fetchData: () => void;
  CATEGORY_OPTIONS: any[];
  COUNTY_OPTIONS: string[];
};

export default function ResourcesPanel({
  resources,
  fetchData,
  CATEGORY_OPTIONS,
  COUNTY_OPTIONS,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedResource, setEditedResource] = useState<any>({});

  const updateResource = async (resource: any) => {
    const finalData =
      editingId === resource.id ? editedResource : resource;

    const { error } = await supabase
      .from("resources")
      .update({
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
      })
      .eq("id", resource.id);

    if (error) {
      alert("Update failed.");
      return;
    }

    setEditingId(null);
    fetchData();
  };

  const deleteResource = async (id: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this resource?"
    );
    if (!confirmDelete) return;

    await supabase.from("resources").delete().eq("id", id);

    fetchData();
  };

  if (resources.length === 0) {
    return (
      <div className="text-zinc-400">
        No live resources found.
      </div>
    );
  }

  return (
    <>
      {resources.map((resource) => {
        const isEditing = editingId === resource.id;

        return (
          <div
            key={resource.id}
            className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl mb-6"
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
                <h2 className="text-xl font-semibold mb-2">
                  {resource.organization}
                </h2>

                <p className="text-zinc-400 mb-4">
                  {resource.description}
                </p>
              </>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setEditingId(resource.id);
                  setEditedResource(resource);
                }}
                className="bg-blue-600 px-4 py-2 rounded-lg"
              >
                Edit
              </button>

              <button
                onClick={() => updateResource(resource)}
                className="bg-green-600 px-4 py-2 rounded-lg"
              >
                Update
              </button>

              <button
                onClick={() => deleteResource(resource.id)}
                className="bg-red-600 px-4 py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}
