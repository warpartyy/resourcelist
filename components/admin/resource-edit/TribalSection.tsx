import TribeSelect from "@/components/forms/suggest-resource/TribeSelect";

type Props = {
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
};

export default function TribalSection({
  editedSubmission,
  setEditedSubmission,
}: Props) {
  const isTribal = editedSubmission.is_tribal || false;

  return (
    <div className="mb-6">
      <div className="mb-2 font-semibold text-sm text-text-muted">
        Tribal Program
      </div>

      {/* Toggle */}
      <label className="flex items-center gap-2 mb-3">
        <input
          type="checkbox"
          checked={isTribal}
          onChange={(e) =>
            setEditedSubmission((prev: any) => ({
              ...prev,
              is_tribal: e.target.checked,
              tribe: e.target.checked ? prev.tribe : null,
              tribal_eligibility: e.target.checked
                ? prev.tribal_eligibility
                : null,
            }))
          }
        />
        This is a tribal program
      </label>

      {/* Tribe + Eligibility */}
      {isTribal && (
        <>
        {/* Tribe */}
<div className="mb-3">
  <div className="text-sm text-text-muted mb-1">
    Tribe
  </div>

  <TribeSelect
    value={editedSubmission.tribe || ""}
    onChange={(val) =>
      setEditedSubmission((prev: any) => ({
        ...prev,
        tribe: val,
      }))
    }
  />
</div>



          {/* Eligibility Options */}
          <div className="space-y-2">
            <div className="text-sm text-text-muted mb-1">
              Who is eligible?
            </div>

            {[
              {
                value: "tribal_only",
                label: "Only members of this tribe",
              },
              {
                value: "any_tribe",
                label: "Any federally recognized tribal member",
              },
              {
                value: "open_to_all",
                label: "Open to everyone",
              },
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tribal_eligibility"
                  checked={
                    editedSubmission.tribal_eligibility === option.value
                  }
                  onChange={() =>
                    setEditedSubmission((prev: any) => ({
                      ...prev,
                      tribal_eligibility: option.value,
                    }))
                  }
                />
                {option.label}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}