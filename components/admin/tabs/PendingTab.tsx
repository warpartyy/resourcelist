"use client";

import SubmissionsPanel from "../SubmissionsPanel";

type Props = {
  submissions: any[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
  CATEGORY_OPTIONS: any[];
  COUNTY_OPTIONS: string[];
  onSave: any;
  onApprove: any;
  onReject: any;
};

export default function PendingTab(props: Props) {
  return (
    <SubmissionsPanel
      {...props}
      section="pending"
    />
  );
}