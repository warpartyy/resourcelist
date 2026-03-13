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
  const toggleArrayValue = (
  field: string,
  value: string
) => {
  const current = editedSubmission[field] || [];

  const updated = current.includes(value)
    ? current.filter((v: string) => v !== value)
    : [...current, value];

  setEditedSubmission({
    ...editedSubmission,
    [field]: updated,
  });
};
  return (
    <>
      <div className="text-highlight mb-2 font-semibold">
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
        className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary mb-2"
      />
      
      
      {/* Address */}
<div className="mb-4">
  <div className="mb-2 font-semibold text-sm text-text-muted">
    Address
  </div>

  {/* Street Address */}
  <input
    value={editedSubmission.address || ""}
    onChange={(e) =>
      setEditedSubmission({
        ...editedSubmission,
        address: e.target.value,
      })
    }
    placeholder="Street Address"
    className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary mb-2"
  />

  {/* City / State / ZIP */}
  <div className="grid grid-cols-3 gap-2">
    <input
      value={editedSubmission.city || ""}
      onChange={(e) =>
        setEditedSubmission({
          ...editedSubmission,
          city: e.target.value,
        })
      }
      placeholder="City"
      className="bg-bg border border-border rounded-lg p-3 text-text-primary"
    />

    <input
      value={editedSubmission.state || "OK"}
      onChange={(e) =>
        setEditedSubmission({
          ...editedSubmission,
          state: e.target.value,
        })
      }
      placeholder="State"
      className="bg-bg border border-border rounded-lg p-3 text-text-primary"
    />

    <input
      value={editedSubmission.zip || ""}
      onChange={(e) =>
        setEditedSubmission({
          ...editedSubmission,
          zip: e.target.value,
        })
      }
      placeholder="ZIP"
      className="bg-bg border border-border rounded-lg p-3 text-text-primary"
    />
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
        className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary mb-2"
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
        className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary mb-2"
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
        className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary mb-2"
      />


{/* Subcategories */}
<div className="mb-6">
  <div className="mb-2 font-semibold text-sm text-text-muted">
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
  onClick={() => toggleArrayValue("subcategories", sub.value)}
  className={`p-3 rounded-lg border transition text-left ${
    isSelected ? "shadow-md" : "bg-bg border-border text-text-muted hover:border-accent"
  }`}
  style={
    isSelected
      ? {
          background: "var(--color-accent)",
          borderColor: "var(--color-accent)",
          color: "white",
        }
      : undefined
  }
>
  {sub.label}
</button>
      );
    })}
  </div>
</div>



{/* Tags */}
<div className="mb-6">
  <div className="mb-3 font-semibold text-sm text-text-muted">
    Tags
  </div>

  {Object.entries(TAG_GROUPS).map(([groupName, tags]) => (
    <div
  key={groupName}
  className="mb-8 pb-6 border-b border-border last:border-b-0"
>

      <div className="capitalize text-xs text-text-subtle mb-3">
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
  onClick={() => toggleArrayValue("tags", tag)}
  className={`p-3 rounded-lg border transition text-left cursor-pointer ${
    selected ? "shadow-md" : "bg-bg border-border text-text-muted hover:border-accent"
  }`}
  style={
    selected
      ? {
          background: "var(--color-accent)",
          borderColor: "var(--color-accent)",
          color: "white",
        }
      : undefined
  }
>
  {tag}
</button>
          );
        })}
      </div>
    </div>
  ))}
</div>

      {/* Counties Served */}
      <div className="mb-4">
        <div className="mb-2 font-semibold text-sm text-text-muted">
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
        className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary mb-2"
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
        className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary mb-4"
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
        className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary mb-4"
      />
    </>
  );
}
