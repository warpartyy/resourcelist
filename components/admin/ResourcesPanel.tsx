"use client";

import { useState } from "react";
import ResourceEditForm from "./ResourceEditForm";
import { updateResource, deleteResource } from "@/lib/services/resourceService";



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


const handleDelete = async (id: string) => {
  const confirmDelete = confirm(
    "Are you sure you want to delete this resource?"
  );
  if (!confirmDelete) return;

  const { error } = await deleteResource(id);

  if (error) {
    alert("Delete failed.");
    return;
  }

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
  onClick={async () => {
    const finalData =
      editingId === resource.id ? editedResource : resource;

    const { error } = await updateResource(resource.id, finalData);

    if (error) {
      alert("Update failed.");
      return;
    }

    setEditingId(null);
    fetchData();
  }}
  className="bg-green-600 px-4 py-2 rounded-lg"
>
  Update
</button>


<button
  onClick={() => handleDelete(resource.id)}
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
