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
  onSuccess: () => void;
  search: string;
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
  onSuccess,
  search,
}: Props) {

  const filteredSubmissions = submissions.filter((submission) => {
  const searchText = (search || "").toLowerCase();

  const combined = [
    submission.organization,
    submission.city,
    submission.services,
    submission.description,
    submission.eligibility,
    submission.counties_served,
    ...(Array.isArray(submission.tags) ? submission.tags : []),
  ]
    .filter(Boolean) // removes null/undefined
    .join(" ")
    .toLowerCase();

  return combined.includes(searchText);
});

  return (
    <>
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

      {filteredSubmissions.length === 0 ? (
        <div className="text-text-muted">
          No {section} submissions.
        </div>
      ) : (
        filteredSubmissions.map((submission) => (
          <SubmissionCard
  key={submission.id}
  submission={submission}
  section={section}
  editingId={editingId}
  setEditingId={setEditingId}
  editedSubmission={editedSubmission}
  setEditedSubmission={setEditedSubmission}
  CATEGORY_OPTIONS={CATEGORY_OPTIONS}
  COUNTY_OPTIONS={COUNTY_OPTIONS}
  onSuccess={onSuccess}
/>
        ))
      )}
    </>
  );
}