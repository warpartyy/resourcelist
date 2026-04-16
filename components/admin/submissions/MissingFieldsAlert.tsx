// /components/admin/submissions/MissingFieldsAlert.tsx

type Props = {
  missingFields: string[];
  section: "pending" | "approved" | "rejected";
};

export default function MissingFieldsAlert({
  missingFields,
  section,
}: Props) {
  if (section !== "pending" || missingFields.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
      <div className="text-xs font-medium text-amber-700">
        Missing information
      </div>
      <div className="text-xs text-amber-800 mt-1">
        {missingFields.join(" • ")}
      </div>
    </div>
  );
}