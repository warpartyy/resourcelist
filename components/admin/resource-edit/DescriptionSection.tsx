type Props = {
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
};

export default function DescriptionSection({
  editedSubmission,
  setEditedSubmission,
}: Props) {
  return (
    <>
<textarea
  value={editedSubmission.description || ""}
  onChange={(e) =>
    setEditedSubmission((prev: any) => ({
      ...prev,
      description: e.target.value,
    }))
  }
  placeholder="Description"
  className="w-full bg-bg border border-border rounded-lg p-3 mb-2 min-h-[140px]"
/>

{/* --- ADDITIONAL ELIGIBILITY DETAILS --- */}
<div className="mb-2 font-semibold text-sm text-text-muted">
  Additional Eligibility Details
</div>

<textarea
  value={editedSubmission.eligibility || ""}
  onChange={(e) =>
    setEditedSubmission((prev: any) => ({
      ...prev,
      eligibility: e.target.value,
    }))
  }
  placeholder="Add any specific requirements (e.g., must be enrolled in a federally recognized tribe, income limits, documents needed...)"
  className="w-full bg-bg border border-border rounded-lg p-3 mb-4"
/>


    </>
  );
}