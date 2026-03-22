import { TAG_GROUPS } from "@/lib/taxonomy";
import { useState } from "react";

type Props = {
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
};

export default function TagsSection({
  editedSubmission,
  setEditedSubmission,
}: Props) {
  const toggle = (tag: string) => {
    setEditedSubmission((prev: any) => {
      const current = Array.isArray(prev.tags) ? prev.tags : [];

      const updated = current.includes(tag)
        ? current.filter((t: string) => t !== tag)
        : [...current, tag];

      return {
        ...prev,
        tags: updated,
      };
    });
  };

const formatTagLabel = (tag: string) => {
  return tag
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const GROUP_LABELS: Record<string, string> = {
  serviceType: "Service Type",
  population: "Population",
  access: "Access",
  payment: "Payment",
  eligibility: "Eligibility",
  logistics: "Additional Details",
};

const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

const toggleGroup = (group: string) => {
  setOpenGroups((prev) => ({
    ...prev,
    [group]: !(prev[group] ?? false),
  }));
};


  return (
    <div className="mb-6">
      <div className="mb-3 font-semibold text-sm text-text-muted">
        Tags
      </div>

      {Object.entries(TAG_GROUPS).map(([groupName, tags]) => {
  const selectedCount =
    (editedSubmission.tags || []).filter((t: string) =>
      tags.includes(t)
    ).length;

  return (
        
        <div
          key={GROUP_LABELS[groupName] || groupName}
          className="mb-4 rounded-xl border border-border bg-surface p-4"
        >
<button
  type="button"
  onClick={() => toggleGroup(groupName)}
  className="w-full flex items-center justify-between text-sm font-medium mb-2 tag-group-header"
>
<span>
  {GROUP_LABELS[groupName] || groupName}
  {selectedCount > 0 && (
    <span className="ml-2 text-xs text-text-subtle">
      ({selectedCount})
    </span>
  )}
</span>
</button>

{openGroups[groupName] === true && (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {tags.map((tag) => {
      const selected =
        editedSubmission.tags?.includes(tag) || false;

      return (
        <button
          key={tag}
          type="button"
          onClick={() => toggle(tag)}
          className={`px-3 py-2 rounded-md text-sm transition text-left tag ${
  selected
    ? "tag-selected shadow-sm"
    : "hover:border-accent hover:bg-surface"
}`}
        >
          {formatTagLabel(tag)}
        </button>
      );
    })}
  </div>
)}
        </div>
        );
})}
    </div>
  );
}