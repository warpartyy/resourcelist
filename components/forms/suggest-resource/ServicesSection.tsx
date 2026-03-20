"use client";

import { SUBCATEGORIES } from "@/lib/taxonomy";

type Props = {
  selectedSubcategories: string[];
  setSelectedSubcategories: (val: string[]) => void;
  errors: {
    subcategories?: string;
  };
  subcategoryRef: React.RefObject<HTMLDivElement | null>;
};

export default function ServicesSection({
  selectedSubcategories,
  setSelectedSubcategories,
  errors,
  subcategoryRef,
}: Props) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary">
          Services & Categories
        </h2>
        <p className="text-sm text-text-muted">
          Select all service types that apply.
        </p>
      </div>

      {/* Error */}
      {errors.subcategories && (
        <p className="text-red-400 text-sm">
          {errors.subcategories}
        </p>
      )}

      {/* Subcategories Grid */}
      <div
        ref={subcategoryRef}
        className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${
          errors.subcategories
            ? "border border-red-500 p-3 rounded-lg"
            : ""
        }`}
      >
        {SUBCATEGORIES.map((sub) => {
          const isSelected = selectedSubcategories.includes(sub.value);

          return (
            <button
              type="button"
              key={sub.value}
              onClick={() => {
                if (isSelected) {
                  setSelectedSubcategories(
                    selectedSubcategories.filter((val) => val !== sub.value)
                  );
                } else {
                  setSelectedSubcategories([
                    ...selectedSubcategories,
                    sub.value,
                  ]);
                }
              }}
              className={`p-3 rounded-lg border transition text-left ${
                isSelected
                  ? "shadow-md"
                  : "bg-bg border-border text-text-muted hover:border-accent"
              }`}
              style={
                isSelected
                  ? {
                      background: "var(--color-accent)",
                      borderColor: "var(--color-accent)",
                      color: "white",
                    }
                  : undefined
              }
            >
              {sub.label}
            </button>
          );
        })}
      </div>

    </div>
  );
}