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
  onApprove,
  onReject,
}: Props) {
  const isEditing = editingId === submission.id;

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl mb-6">
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
          {/* Top Row */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="text-lg font-semibold">
                {submission.organization}
              </h2>

              <p className="text-zinc-400 text-sm mt-1 line-clamp-2">
                {submission.description}
              </p>
            </div>

            {/* Status Badge */}
            {submission.status && (
              <span
              className={`text-xs px-2 py-1 rounded-full ${
                submission.status === "pending"
                ? "bg-yellow-600/20 text-yellow-400"
                : submission.status === "approved"
                ? "bg-emerald-600/20 text-emerald-400"
                : "bg-red-600/20 text-red-400"
    }`}
  >
    {submission.status.charAt(0).toUpperCase() +
      submission.status.slice(1)}
  </span>
)}

          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap gap-6 text-sm text-zinc-400 mb-4">
            {submission.counties_served?.length > 0 && (
              <span>
                <span className="text-zinc-500">Counties:</span>{" "}
                {submission.counties_served.join(", ")}
              </span>
            )}

            {submission.parent_categories?.length > 0 && (
              <span>
                <span className="text-zinc-500">Category:</span>{" "}
                {submission.parent_categories.join(", ")}
              </span>
            )}

            {submission.created_at && (
              <span>
                <span className="text-zinc-500">Submitted:</span>{" "}
                {new Date(submission.created_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </>
      )}


      {/* Actions */}
<div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">

  {!isEditing ? (
    <>
      <button
        onClick={() => {
          setEditingId(submission.id);
          setEditedSubmission(submission);
        }}
        className="px-3 py-1.5 rounded-md text-sm font-medium bg-zinc-800 hover:bg-zinc-700 transition"
      >
        Edit
      </button>

      <button
        onClick={() => onApprove(submission)}
        className="px-3 py-1.5 rounded-md text-sm font-medium bg-emerald-600 hover:bg-emerald-500 transition"
      >
        Approve
      </button>

      <button
        onClick={() => onReject(submission.id)}
        className="px-3 py-1.5 rounded-md text-sm font-medium border border-red-600 text-red-500 hover:bg-red-600 hover:text-white transition"
      >
        Reject
      </button>
    </>
  ) : (
    <>
      {/* Save Changes */}
      <button
        onClick={() => onApprove(editedSubmission)}
        className="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-500 transition"
      >
        Save Changes
      </button>

      {/* Approve after editing */}
      <button
        onClick={() => onApprove(editedSubmission)}
        className="px-3 py-1.5 rounded-md text-sm font-medium bg-emerald-600 hover:bg-emerald-500 transition"
      >
        Approve
      </button>

      <button
        onClick={() => setEditingId(null)}
        className="px-3 py-1.5 rounded-md text-sm font-medium border border-zinc-600 text-zinc-300 hover:bg-zinc-800 transition"
      >
        Cancel
      </button>
    </>
  )}
</div>
    </div>
  );
}
