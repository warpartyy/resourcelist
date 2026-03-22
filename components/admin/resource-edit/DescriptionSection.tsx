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
        className="w-full bg-bg border border-border rounded-lg p-3 mb-2"
      />

      <input
        value={editedSubmission.eligibility || ""}
        onChange={(e) =>
          setEditedSubmission((prev: any) => ({
            ...prev,
            eligibility: e.target.value,
          }))
        }
        placeholder="Eligibility"
        className="w-full bg-bg border border-border rounded-lg p-3 mb-4"
      />
    </>
  );
}