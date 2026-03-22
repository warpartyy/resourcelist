type Props = {
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
};

export default function BasicInfoSection({
  editedSubmission,
  setEditedSubmission,
}: Props) {
  return (
    <input
      value={editedSubmission.organization || ""}
      onChange={(e) =>
        setEditedSubmission((prev: any) => ({
          ...prev,
          organization: e.target.value,
        }))
      }
      placeholder="Organization"
      className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary mb-2"
    />
  );
}