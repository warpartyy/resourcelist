"use client";

import SubmissionCard from "./SubmissionCard";

type Props = {
  submissions: any[];
  section: "pending" | "approved" | "rejected";
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
  CATEGORY_OPTIONS: any[];
  COUNTY_OPTIONS: string[];
  onApprove: (submission: any) => void;
  onReject: (id: string) => void;
};

export default function SubmissionsPanel({
  submissions,
  section,
  editingId,
  setEditingId,
  editedSubmission,
  setEditedSubmission,
  CATEGORY_OPTIONS,
  COUNTY_OPTIONS,
  onApprove,
  onReject,
}: Props) {
  return (
    <>
      {/* Section Header */}
{/* Section Header */}
<div className="mb-4 mt-0">
  <p className="text-text-primary text-base font-medium">
    {section === "pending" &&
      "Review and approve new submissions."}
    {section === "approved" &&
      "Previously approved submissions."}
    {section === "rejected" &&
      "Submissions that were not approved."}
  </p>
</div>


      {/* Empty State */}
      {submissions.length === 0 ? (
        <div className="text-text-muted">
          No {section} submissions.
        </div>
      ) : (
        submissions.map((submission) => (
          <SubmissionCard
            key={submission.id}
            submission={submission}
            editingId={editingId}
            setEditingId={setEditingId}
            editedSubmission={editedSubmission}
            setEditedSubmission={setEditedSubmission}
            CATEGORY_OPTIONS={CATEGORY_OPTIONS}
            COUNTY_OPTIONS={COUNTY_OPTIONS}
            onApprove={onApprove}
            onReject={onReject}
          />
        ))
      )}
    </>
  );
}
