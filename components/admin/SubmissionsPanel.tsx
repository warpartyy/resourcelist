"use client";

import SubmissionCard from "./SubmissionCard";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";



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
  sortOrder: "az" | "za" | "newest" | "oldest";
  highlightedCommentId?: string | null;
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
  sortOrder,
  highlightedCommentId,
}: Props) {

const searchText = (search || "").toLowerCase();

const { user, loading } = useCurrentUser();

const filteredSubmissions = [...submissions]
  .filter((submission) => {
    
    const combined = [
      submission.organization,
      submission.city,
      submission.services,
      submission.description,
      submission.eligibility,
      submission.counties_served,
      ...(Array.isArray(submission.tags) ? submission.tags : []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return combined.includes(searchText);
  })
  .sort((a, b) => {
    const nameA = a.organization || "";
    const nameB = b.organization || "";

    if (sortOrder === "az") return nameA.localeCompare(nameB);
    if (sortOrder === "za") return nameB.localeCompare(nameA);

    if (sortOrder === "newest") {
      return (
        new Date(b.submitted_at || 0).getTime() -
        new Date(a.submitted_at || 0).getTime()
      );
    }

    if (sortOrder === "oldest") {
      return (
        new Date(a.submitted_at || 0).getTime() -
        new Date(b.submitted_at || 0).getTime()
      );
    }

    return 0;
  });
return (
  <>
    {filteredSubmissions.length === 0 ? (
      <div className="text-text-muted">
        No {section} submissions.
      </div>
    ) : (
      <div className="space-y-4 md:space-y-6">
        {filteredSubmissions.map((submission) => (
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
            user={user}
            highlightedCommentId={highlightedCommentId}
          />
        ))}
      </div>
    )}
  </>
);
}