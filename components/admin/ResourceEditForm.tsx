"use client";
import {PARENT_CATEGORIES, SUBCATEGORIES, TAG_GROUPS,} from "@/lib/taxonomy";
import AdditionalLocationsSection from "./resource-edit/AdditionalLocationsSection";
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
import { EditableLocation } from "@/lib/types/location";
import CommentsSection from "@/components/admin/CommentsSection";

type Props = {
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
additionalLocations: any[];
setAdditionalLocations: (data: any[]) => void;
  CATEGORY_OPTIONS: { label: string; value: string }[];
  COUNTY_OPTIONS: string[];
  onCancel: () => void;
  user: any;
  highlightedCommentId?: string | null;
  submissionStatus: "pending" | "approved" | "rejected";
  
};

export default function ResourceEditForm({
  editedSubmission,
  setEditedSubmission,
  additionalLocations,
  setAdditionalLocations,
  CATEGORY_OPTIONS,
  COUNTY_OPTIONS,
  onCancel,
  user,
  highlightedCommentId,
  submissionStatus,
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

<AdditionalLocationsSection
  locations={additionalLocations}
  setLocations={setAdditionalLocations}
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

{editedSubmission?.id && (
<CommentsSection
  resourceId={editedSubmission.id}
  user={user}
  highlightedCommentId={highlightedCommentId}
  status={submissionStatus} // ✅ USE REAL STATUS
/>
)}
  
  <AdminNotesSection
    editedSubmission={editedSubmission}
    setEditedSubmission={setEditedSubmission}
  />
</>
  );
}
