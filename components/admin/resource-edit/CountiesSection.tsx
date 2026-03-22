import CountySelect from "./CountySelect";

type Props = {
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
  COUNTY_OPTIONS: string[];
};

export default function CountiesSection({
  editedSubmission,
  setEditedSubmission,
  COUNTY_OPTIONS,
}: Props) {
  return (
    <div className="mb-4">
      <div className="mb-2 font-semibold text-sm text-text-muted">
        Counties Served
      </div>

      <CountySelect
        selected={editedSubmission.counties_served || []}
        options={COUNTY_OPTIONS}
        onChange={(val) =>
          setEditedSubmission((prev: any) => ({
            ...prev,
            counties_served: val,
          }))
        }
      />
    </div>
  );
}