type Props = {
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
};

export default function LocationSection({
  editedSubmission,
  setEditedSubmission,
}: Props) {
  return (
    <div className="mb-4">
      <div className="mb-2 font-semibold text-sm text-text-muted">
        Address
      </div>

      <input
        value={editedSubmission.address || ""}
        onChange={(e) =>
          setEditedSubmission((prev: any) => ({
            ...prev,
            address: e.target.value,
          }))
        }
        placeholder="Street Address"
        className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary mb-2"
      />

      <div className="grid grid-cols-3 gap-2">
        <input
          value={editedSubmission.city || ""}
          onChange={(e) =>
            setEditedSubmission((prev: any) => ({
              ...prev,
              city: e.target.value,
            }))
          }
          placeholder="City"
          className="bg-bg border border-border rounded-lg p-3"
        />

        <input
          value={editedSubmission.state || ""}
          onChange={(e) =>
            setEditedSubmission((prev: any) => ({
              ...prev,
              state: e.target.value,
            }))
          }
          placeholder="State"
          className="bg-bg border border-border rounded-lg p-3"
        />

        <input
          value={editedSubmission.zip || ""}
          onChange={(e) =>
            setEditedSubmission((prev: any) => ({
              ...prev,
              zip: e.target.value,
            }))
          }
          placeholder="ZIP"
          className="bg-bg border border-border rounded-lg p-3"
        />
      </div>
    </div>
  );
}