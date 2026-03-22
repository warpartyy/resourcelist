"use client";
import {PARENT_CATEGORIES, SUBCATEGORIES, TAG_GROUPS,} from "@/lib/taxonomy";
import {
  BasicInfoSection,
  LocationSection,
  ContactSection,
  CategoriesSection,
  TagsSection,
  CountiesSection,
  DescriptionSection,
  AdminNotesSection,
  TribalSection,
} from "@/components/admin/resource-edit";

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

  setEditedSubmission((prev: any) => ({
  ...prev,
  [field]: updated,
}));
};
  return (
    
    <>
  <div className="text-highlight mb-2 font-semibold">
    Editing Mode
  </div>

  <BasicInfoSection
    editedSubmission={editedSubmission}
    setEditedSubmission={setEditedSubmission}
  />

  <TribalSection
    editedSubmission={editedSubmission}
    setEditedSubmission={setEditedSubmission}
  />

  <LocationSection
    editedSubmission={editedSubmission}
    setEditedSubmission={setEditedSubmission}
  />

  <ContactSection
    editedSubmission={editedSubmission}
    setEditedSubmission={setEditedSubmission}
  />

  <CountiesSection
    editedSubmission={editedSubmission}
    setEditedSubmission={setEditedSubmission}
    COUNTY_OPTIONS={COUNTY_OPTIONS}
  />

  <DescriptionSection
    editedSubmission={editedSubmission}
    setEditedSubmission={setEditedSubmission}
  />

  <CategoriesSection
    editedSubmission={editedSubmission}
    setEditedSubmission={setEditedSubmission}
  />

  <TagsSection
    editedSubmission={editedSubmission}
    setEditedSubmission={setEditedSubmission}
  />
  
  <AdminNotesSection
    editedSubmission={editedSubmission}
    setEditedSubmission={setEditedSubmission}
  />
</>
  );
}
