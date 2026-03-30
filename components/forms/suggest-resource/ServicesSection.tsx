"use client";

import { SUBCATEGORIES } from "@/lib/taxonomy";
import { SERVICES_BY_SUBCATEGORY } from "@/lib/constants/servicesBySubcategory";

type Props = {
  selectedSubcategories: string[];
  setSelectedSubcategories: React.Dispatch<React.SetStateAction<string[]>>;

  // ✅ ADD THESE
  selectedServices: string[];
  setSelectedServices: React.Dispatch<React.SetStateAction<string[]>>;

  errors: {
    subcategories?: string;
  };

  subcategoryRef: React.RefObject<HTMLDivElement | null>;
};



export default function ServicesSection({
  selectedSubcategories,
  setSelectedSubcategories,
  selectedServices,
  setSelectedServices,
  errors,
  subcategoryRef,
}: Props) {

  const availableServices: string[] = Array.from(
  new Set(
    selectedSubcategories.flatMap(
      (subcat) => SERVICES_BY_SUBCATEGORY[subcat] || []
    )
  )
);

const toggleService = (service: string) => {
  setSelectedServices((prev) =>
    prev.includes(service)
      ? prev.filter((s) => s !== service)
      : [...prev, service]
  );
};

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
              const updated = isSelected
                ? selectedSubcategories.filter((val) => val !== sub.value)
                : [...selectedSubcategories, sub.value];

              setSelectedSubcategories(updated);

              // ✅ Clean services based on new subcategories
              const allowedServices = updated.flatMap(
                (subcat) => SERVICES_BY_SUBCATEGORY[subcat] || []
              );

              setSelectedServices((prev) =>
                prev.filter((service) => allowedServices.includes(service))
              );
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

    {/* ✅ SERVICES SECTION (correct placement) */}
    {availableServices.length > 0 && (
      <div className="mt-6">
        <div className="mb-2 font-semibold text-sm text-text-muted">
          Services
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availableServices.map((service) => {
            const isSelected = selectedServices.includes(service);

            return (
              <button
                key={service}
                type="button"
                onClick={() => toggleService(service)}
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
                {service}
              </button>
            );
          })}
        </div>
      </div>
    )}
  </div>
);
}