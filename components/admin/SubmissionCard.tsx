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
          <h2 className="text-xl font-semibold mb-2">
            {submission.organization}
          </h2>

          <p className="text-zinc-400 mb-4">
            {submission.description}
          </p>
        </>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => {
            setEditingId(submission.id);
            setEditedSubmission(submission);
          }}
          className="bg-blue-600 px-4 py-2 rounded-lg"
        >
          Edit
        </button>

        <button
          onClick={() => onApprove(submission)}
          className="bg-green-600 px-4 py-2 rounded-lg"
        >
          Approve
        </button>

        <button
          onClick={() => onReject(submission.id)}
          className="bg-red-600 px-4 py-2 rounded-lg"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
