type Props = {
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
};

export default function AdminNotesSection({
  editedSubmission,
  setEditedSubmission,
}: Props) {
  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-text-subtle mb-1">
        Admin Notes
      </label>

      <textarea
        placeholder="Add notes about this submission..."
        value={editedSubmission.admin_notes || ""}
        onChange={(e) =>
          setEditedSubmission((prev: any) => ({
            ...prev,
            admin_notes: e.target.value,
          }))
        }
        className="w-full p-2 border border-border rounded-md bg-bg text-sm"
        rows={3}
      />
    </div>
  );
}