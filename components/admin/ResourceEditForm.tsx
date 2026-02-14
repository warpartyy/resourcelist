"use client";

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

      {/* Categories */}
      <div className="mb-4">
        <div className="mb-2 font-semibold text-sm text-zinc-400">
          Categories
        </div>

        <div className="grid grid-cols-2 gap-2">
          {CATEGORY_OPTIONS.map((option) => {
            const selected =
              editedSubmission.categories?.includes(option.value);

            return (
              <label
                key={option.value}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => {
                    let updatedCategories =
                      editedSubmission.categories || [];

                    if (selected) {
                      updatedCategories =
                        updatedCategories.filter(
                          (c: string) => c !== option.value
                        );
                    } else {
                      updatedCategories = [
                        ...updatedCategories,
                        option.value,
                      ];
                    }

                    setEditedSubmission({
                      ...editedSubmission,
                      categories: updatedCategories,
                    });
                  }}
                />
                {option.label}
              </label>
            );
          })}
        </div>
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

      <button
        onClick={onCancel}
        className="bg-zinc-700 px-4 py-2 rounded-lg mb-4"
      >
        Cancel Edit
      </button>
    </>
  );
}
