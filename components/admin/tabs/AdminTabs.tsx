"use client";

import PendingTab from "./PendingTab";
import RejectedTab from "./RejectedTab";
import ResourcesTab from "./ResourcesTab";

type Props = {
  adminSection: "pending" | "rejected" | "resources" | "deleted";
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
  CATEGORY_OPTIONS: any[];
  COUNTY_OPTIONS: string[];
  onSuccess: () => void;
  sortOrder: "az" | "za" | "newest" | "oldest";
  setSortOrder: (value: "az" | "za" | "newest" | "oldest") => void;
};

export default function AdminTabs(props: Props) {
  const {
    adminSection,
    editingId,
    setEditingId,
    editedSubmission,
    setEditedSubmission,
    CATEGORY_OPTIONS,
    COUNTY_OPTIONS,
    onSuccess,
    sortOrder,
    setSortOrder,
  } = props;

  if (adminSection === "pending") {
    return (
      <PendingTab
        editingId={editingId}
        setEditingId={setEditingId}
        editedSubmission={editedSubmission}
        setEditedSubmission={setEditedSubmission}
        CATEGORY_OPTIONS={CATEGORY_OPTIONS}
        COUNTY_OPTIONS={COUNTY_OPTIONS}
        onSuccess={onSuccess}
      />
    );
  }

  if (adminSection === "rejected") {
    return (
      <RejectedTab
        editingId={editingId}
        setEditingId={setEditingId}
        editedSubmission={editedSubmission}
        setEditedSubmission={setEditedSubmission}
        CATEGORY_OPTIONS={CATEGORY_OPTIONS}
        COUNTY_OPTIONS={COUNTY_OPTIONS}
        onSuccess={onSuccess}
      />
    );
  }

  if (adminSection === "resources" || adminSection === "deleted") {
    return (
      <ResourcesTab
        adminSection={adminSection}
        CATEGORY_OPTIONS={CATEGORY_OPTIONS}
        COUNTY_OPTIONS={COUNTY_OPTIONS}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        onSuccess={onSuccess}
      />
    );
  }

  return null;
}