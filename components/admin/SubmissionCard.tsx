"use client";

import ResourceEditForm from "./ResourceEditForm";

type Props = {
  submission: any;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
  CATEGORY_OPTIONS: any[];
  COUNTY_OPTIONS: string[];
  onSave: (submission: any) => void;
  onApprove: (submission: any) => void;
  onReject: (id: string) => void;
};

export default function SubmissionCard({
  submission,
  editingId,
  setEditingId,
  editedSubmission,
  setEditedSubmission,
  CATEGORY_OPTIONS,
  COUNTY_OPTIONS,
  onSave,
  onApprove,
  onReject,
}: Props) {
  const isEditing = editingId === submission.id;

 return (
  <div className="bg-surface border border-border p-6 rounded-xl mb-6 shadow-sm">

    {/* TOP ROW (ALWAYS VISIBLE) */}
    <div className="flex justify-between items-start mb-3">

      {/* LEFT SIDE */}
      <div className="flex-1 pr-4">
        <h2 className="text-lg font-semibold">
          {submission.organization}
        </h2>
      </div>

      {/* RIGHT SIDE (BUTTONS + STATUS) */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        {/* Buttons */}
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => {
                  setEditingId(submission.id);
                  setEditedSubmission(submission);
                }}
                className="px-3 py-1.5 rounded-md text-sm font-medium bg-bg border border-border hover:bg-surface transition"
              >
                Edit
              </button>

              <button
                onClick={() => onApprove(submission)}
                className="button button-primary"
              >
                Approve
              </button>

              <button
                onClick={() => onReject(submission.id)}
                className="px-3 py-1.5 rounded-md text-sm font-medium border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition"
              >
                Reject
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onSave(editedSubmission)}
                className="button button-secondary"
              >
                Save
              </button>

              <button
                onClick={() => onApprove(editedSubmission)}
                className="button button-primary"
              >
                Approve
              </button>

              <button
                onClick={() => setEditingId(null)}
                className="px-3 py-1.5 rounded-md text-sm font-medium border border-border text-text-muted hover:bg-bg transition"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>

    {/* CONTENT SWITCH */}
    {isEditing ? (
      <ResourceEditForm
        editedSubmission={editedSubmission}
        setEditedSubmission={setEditedSubmission}
        CATEGORY_OPTIONS={CATEGORY_OPTIONS}
        COUNTY_OPTIONS={COUNTY_OPTIONS}
        onCancel={() => setEditingId(null)}
      />
    ) : (
      <>
        {/* Contact Info */}
        <div className="text-sm text-text-muted mt-2 space-y-1">
          {submission.address && (
            <div>
              <span className="text-text-subtle">Address:</span>{" "}
              {submission.address}
              {submission.city && `, ${submission.city}`}
              {submission.state && `, ${submission.state}`}
              {submission.zip && ` ${submission.zip}`}
            </div>
          )}

          {submission.email && (
            <div>
              <span className="text-text-subtle">Email:</span>{" "}
              {submission.email}
            </div>
          )}

          {submission.phone && (
            <div>
              <span className="text-text-subtle">Phone:</span>{" "}
              {submission.phone}
            </div>
          )}
        </div>

        {/* Description */}
        {submission.description && (
          <p className="text-text-muted text-sm mt-4">
            {submission.description}
          </p>
        )}

        {/* Metadata Row */}
        <div className="flex flex-wrap gap-6 text-sm text-text-muted mt-4">
          {submission.counties_served?.length > 0 && (
            <span>
              <span className="text-text-subtle">Counties:</span>{" "}
              {submission.counties_served.join(", ")}
            </span>
          )}

          {submission.parent_categories?.length > 0 && (
            <span>
              <span className="text-text-subtle">Category:</span>{" "}
              {submission.parent_categories.join(", ")}
            </span>
          )}

          {submission.created_at && (
            <span>
              <span className="text-text-subtle">Submitted:</span>{" "}
              {new Date(submission.created_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </>
    )}
  </div>
);
}