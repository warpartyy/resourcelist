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
  onSuccess: () => void;
};

export default function RejectedTab(props: Props) {
  return (
    <SubmissionsPanel
      {...props}
      section="rejected"
    />
  );
}