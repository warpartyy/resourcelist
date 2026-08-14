"use client";

type Props = {
  defaultValues?: {
    description?: string;
    eligibility?: string;
  };
};

export default function AdditionalDetailsSection({ defaultValues }: Props) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">
          Additional Details
        </h2>
        <p className="text-sm text-text-muted">
          Help others understand what this organization provides.
        </p>
      </div>

      <textarea
        name="description"
        placeholder="Description"
        defaultValue={defaultValues?.description ?? ""}
        className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary"
      />

      <textarea
        name="eligibility"
        placeholder="Eligibility"
        defaultValue={defaultValues?.eligibility ?? ""}
        className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary"
      />
    </div>
  );
}
