"use client";

import ResourceEditForm from "./ResourceEditForm";
import SaveButton from "./actions/SaveButton";
import MoveSubmissionToPendingButton from "./actions/MoveToPendingButton";
import ApproveButton from "./actions/ApproveButton";
import DeleteButton from "./actions/DeleteButton";
import RejectButton from "./actions/RejectButton";


type Props = {
  submission: any;
  section: "pending" | "approved" | "rejected";
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
  CATEGORY_OPTIONS: any[];
  COUNTY_OPTIONS: string[];
  onSuccess: () => void;
};

export default function SubmissionCard({
  submission,
  section,
  editingId,
  setEditingId,
  editedSubmission,
  setEditedSubmission,
  CATEGORY_OPTIONS,
  COUNTY_OPTIONS,
  onSuccess,
}: Props) {
  const isEditing =
  section === "pending" && editingId === submission.id;

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
    {section === "pending" && (
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

<ApproveButton
  resource={submission}
  onSuccess={() => {
    setEditingId(null);
    onSuccess();
  }}
/>

<RejectButton
  resource={submission}
  onSuccess={() => {
    onSuccess();
  }}
/>
      </>
    )}

    {section === "rejected" && (
      <>
<ApproveButton
  resource={submission}
  onSuccess={() => {
    setEditingId(null);
    onSuccess();
  }}
/>

        <MoveSubmissionToPendingButton
          submission={submission}
          onSuccess={() => {
            setEditingId(null);
            onSuccess();
          }}
        />

<DeleteButton
  resource={submission}
  onSuccess={() => {
    setEditingId(null);
    onSuccess();
  }}
/>
      </>
    )}

    {section === "approved" && null}
  </>
) : (
<>
<SaveButton
  resourceId={submission.id}
  editedData={editedSubmission}
  onSuccess={() => {
    setEditingId(null);
    onSuccess();
  }}
/>

<ApproveButton
  resource={submission}
  editedData={editedSubmission}
  isEditing={true}
  onSuccess={() => {
    setEditingId(null);
    onSuccess();
  }}
/>

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
{/* Admin Notes */}
{submission.admin_notes && (
<div className="mt-4 p-3 bg-bg border border-border rounded-md">
  <div className="text-xs text-text-subtle mb-1">
    Admin Notes
  </div>

  {submission.admin_notes ? (
    <div className="text-sm text-text-muted">
      {submission.admin_notes}
    </div>
  ) : (
    <div className="text-sm text-text-muted italic">
      No notes yet
    </div>
  )}

  {submission.last_edited_email && (
    <div className="text-xs text-text-subtle mt-2">
      Last edited by {submission.last_edited_email} on{" "}
      {new Date(submission.last_edited_at).toLocaleString()}
    </div>
    )}
  </div>
)}
        
      </>
    )}
  </div>
);
}