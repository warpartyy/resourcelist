type Props = {
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
};

export default function ContactSection({
  editedSubmission,
  setEditedSubmission,
}: Props) {
  return (
    <>
      <input
        value={editedSubmission.phone || ""}
        onChange={(e) =>
          setEditedSubmission((prev: any) => ({
            ...prev,
            phone: e.target.value,
          }))
        }
        placeholder="Phone"
        className="w-full bg-bg border border-border rounded-lg p-3 mb-2"
      />

      <input
        type="email"
        value={editedSubmission.email || ""}
        onChange={(e) =>
          setEditedSubmission((prev: any) => ({
            ...prev,
            email: e.target.value,
          }))
        }
        placeholder="Email"
        className="w-full bg-bg border border-border rounded-lg p-3 mb-2"
      />

      <input
        value={editedSubmission.website || ""}
        onChange={(e) =>
          setEditedSubmission((prev: any) => ({
            ...prev,
            website: e.target.value,
          }))
        }
        placeholder="Website"
        className="w-full bg-bg border border-border rounded-lg p-3 mb-2"
      />

      <input
        value={editedSubmission.application_link || ""}
        onChange={(e) =>
          setEditedSubmission((prev: any) => ({
            ...prev,
            application_link: e.target.value,
          }))
        }
        placeholder="Application Link"
        className="w-full bg-bg border border-border rounded-lg p-3 mb-2"
      />
    </>
  );
}