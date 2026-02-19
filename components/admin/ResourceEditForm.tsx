"use client";
import {PARENT_CATEGORIES, SUBCATEGORIES, TAG_GROUPS,} from "@/lib/taxonomy";

type Props = {
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
  CATEGORY_OPTIONS: { label: string; value: string }[];
  COUNTY_OPTIONS: string[];
  onCancel: () => void;
};

export default function ResourceEditForm({
  editedSubmission,
  setEditedSubmission,
  CATEGORY_OPTIONS,
  COUNTY_OPTIONS,
  onCancel,
}: Props) {
  return (
    <>
      <div className="text-yellow-400 mb-2 font-semibold">
        Editing Mode
      </div>

      {/* Organization */}
      <input
        value={editedSubmission.organization || ""}
        onChange={(e) =>
          setEditedSubmission({
            ...editedSubmission,
            organization: e.target.value,
          })
        }
        placeholder="Organization"
        className="w-full bg-zinc-800 p-2 rounded mb-2"
      />
      
{/* Subcategories */}
<div className="mb-6">
  <div className="mb-2 font-semibold text-sm text-zinc-400">
    Subcategories
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

    {SUBCATEGORIES.map((sub) => {
      const isSelected =
        editedSubmission.subcategories?.includes(sub.value) || false;

      return (
        <button
          key={sub.value}
          type="button"
          onClick={() => {
            let updated = editedSubmission.subcategories || [];

            if (isSelected) {
              updated = updated.filter(
                (s: string) => s !== sub.value
              );
            } else {
              updated = [...updated, sub.value];
            }

            setEditedSubmission({
              ...editedSubmission,
              subcategories: updated,
            });
          }}
          className={`p-3 rounded-lg border transition text-left ${
            isSelected
              ? "bg-blue-600 border-blue-400 text-white shadow-lg"
              : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-blue-500"
          }`}
        >
          {sub.label}
        </button>
      );
    })}
  </div>
</div>



{/* Tags */}
<div className="mb-6">
  <div className="mb-3 font-semibold text-sm text-zinc-400">
    Tags
  </div>

  {Object.entries(TAG_GROUPS).map(([groupName, tags]) => (
    <div
  key={groupName}
  className="mb-8 pb-6 border-b border-zinc-800 last:border-b-0"
>

      <div className="capitalize text-xs text-zinc-500 mb-3">
        {groupName}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tags.map((tag) => {
          const selected =
            editedSubmission.tags?.includes(tag) || false;

          return (
            <button
              type="button"
              key={tag}
              onClick={() => {
                let updated = editedSubmission.tags || [];

                if (selected) {
                  updated = updated.filter((t: string) => t !== tag);
                } else {
                  updated = [...updated, tag];
                }

                setEditedSubmission({
                  ...editedSubmission,
                  tags: updated,
                });
              }}
className={`p-3 rounded-lg border transition text-left cursor-pointer ${
  selected
    ? "bg-blue-600 border-blue-400 text-white shadow-lg ring-2 ring-blue-400/40"
    : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-blue-500"
}`}

            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  ))}
</div>




      {/* Counties */}
      <div className="mb-4">
        <div className="mb-2 font-semibold text-sm text-zinc-400">
          Counties Served
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
          {COUNTY_OPTIONS.map((county) => {
            const selected =
              editedSubmission.counties_served?.includes(county);

            return (
              <label
                key={county}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => {
                    let updatedCounties =
                      editedSubmission.counties_served || [];

                    if (selected) {
                      updatedCounties =
                        updatedCounties.filter(
                          (c: string) => c !== county
                        );
                    } else {
                      updatedCounties = [
                        ...updatedCounties,
                        county,
                      ];
                    }

                    setEditedSubmission({
                      ...editedSubmission,
                      counties_served: updatedCounties,
                    });
                  }}
                />
                {county}
              </label>
            );
          })}
        </div>
      </div>


      {/* Phone */}
      <input
        value={editedSubmission.phone || ""}
        onChange={(e) =>
          setEditedSubmission({
            ...editedSubmission,
            phone: e.target.value,
          })
        }
        placeholder="Phone"
        className="w-full bg-zinc-800 p-2 rounded mb-2"
      />

      {/* Website */}
      <input
        value={editedSubmission.website || ""}
        onChange={(e) =>
          setEditedSubmission({
            ...editedSubmission,
            website: e.target.value,
          })
        }
        placeholder="Website"
        className="w-full bg-zinc-800 p-2 rounded mb-2"
      />

      {/* Application Link */}
      <input
        value={editedSubmission.application_link || ""}
        onChange={(e) =>
          setEditedSubmission({
            ...editedSubmission,
            application_link: e.target.value,
          })
        }
        placeholder="Application Link"
        className="w-full bg-zinc-800 p-2 rounded mb-2"
      />

      {/* Address */}
      <input
        value={editedSubmission.address || ""}
        onChange={(e) =>
          setEditedSubmission({
            ...editedSubmission,
            address: e.target.value,
          })
        }
        placeholder="Address"
        className="w-full bg-zinc-800 p-2 rounded mb-2"
      />

      {/* Description */}
      <textarea
        value={editedSubmission.description || ""}
        onChange={(e) =>
          setEditedSubmission({
            ...editedSubmission,
            description: e.target.value,
          })
        }
        placeholder="Description"
        className="w-full bg-zinc-800 p-2 rounded mb-2"
      />

      {/* Services */}
      <input
        value={(editedSubmission.services || []).join(", ")}
        onChange={(e) =>
          setEditedSubmission({
            ...editedSubmission,
            services: e.target.value
              .split(",")
              .map((s: string) => s.trim()),
          })
        }
        placeholder="Services (comma separated)"
        className="w-full bg-zinc-800 p-2 rounded mb-4"
      />

      {/* Eligibility */}
      <input
        value={editedSubmission.eligibility || ""}
        onChange={(e) =>
          setEditedSubmission({
            ...editedSubmission,
            eligibility: e.target.value,
          })
        }
        placeholder="Eligibility"
        className="w-full bg-zinc-800 p-2 rounded mb-4"
      />
    </>
  );
}
