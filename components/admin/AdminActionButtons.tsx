type Props = {
  status: "pending" | "approved" | "rejected" | "deleted";
  onApprove?: () => void;
  onReject?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
};

export default function AdminActionButtons({
  status,
  onApprove,
  onReject,
  onDelete,
  onRestore,
}: Props) {
  return (
    <div className="flex gap-2 flex-wrap">

      {/* PENDING */}
      {status === "pending" && (
        <>
          <button onClick={onApprove} className="button button-primary">
            Approve
          </button>

          <button
            onClick={onReject}
            className="px-3 py-1.5 border border-red-500 text-red-500 rounded-md"
          >
            Reject
          </button>
        </>
      )}

      {/* APPROVED */}
      {status === "approved" && (
        <>
          <button
            onClick={onReject}
            className="px-3 py-1.5 border border-yellow-500 text-yellow-600 rounded-md"
          >
            Move to Rejected
          </button>

          <button
            onClick={onDelete}
            className="px-3 py-1.5 border border-red-500 text-red-500 rounded-md"
          >
            Delete
          </button>
        </>
      )}

{/* REJECTED */}
{status === "rejected" && (
  <>
    <button
      onClick={onDelete}
      className="px-3 py-1.5 border border-red-500 text-red-500 rounded-md"
    >
      Move to Deleted
    </button>
  </>
)}

      {/* DELETED */}
      {status === "deleted" && (
        <>
          <button
            onClick={onRestore}
            className="px-3 py-1.5 border border-green-500 text-green-600 rounded-md"
          >
            Restore to Pending
          </button>

          <button
            onClick={onDelete}
            className="px-3 py-1.5 border border-red-700 text-red-700 rounded-md"
          >
            Permanently Delete
          </button>
        </>
      )}
    </div>
  );
}