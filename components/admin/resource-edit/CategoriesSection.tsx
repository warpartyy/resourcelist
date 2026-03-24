import { SUBCATEGORIES } from "@/lib/taxonomy";
import { SERVICES_BY_SUBCATEGORY } from "@/lib/constants/servicesBySubcategory";

type Props = {
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
};

export default function CategoriesSection({
  editedSubmission,
  setEditedSubmission,
}: Props) {
  const toggle = (value: string) => {
    setEditedSubmission((prev: any) => {
      const current = prev.subcategories || [];

      const updated = current.includes(value)
        ? current.filter((v: string) => v !== value)
        : [...current, value];

const allowedServices: string[] = updated.flatMap(
  (subcat: string) => SERVICES_BY_SUBCATEGORY[subcat] || []
);

return {
  ...prev,
  subcategories: updated,
  services: (prev.services || []).filter((s: string) =>
    allowedServices.includes(s)
  ),
};
    });
  };

  const toggleService = (service: string) => {
  setEditedSubmission((prev: any) => {
    const current = prev.services || [];

    const updated = current.includes(service)
      ? current.filter((s: string) => s !== service)
      : [...current, service];

    return {
      ...prev,
      services: updated,
    };
  });
};

  const selectedSubcategories = editedSubmission.subcategories || [];

const availableServices: string[] = Array.from(
  new Set(
    selectedSubcategories.flatMap(
      (subcat: string) => SERVICES_BY_SUBCATEGORY[subcat] || []
    )
  )
);

  return (
    <div className="mb-6">
      <div className="mb-2 font-semibold text-sm text-text-muted">
        Subcategories
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SUBCATEGORIES.map((sub) => {
          const isSelected =
            editedSubmission.subcategories?.includes(sub.value) || false;

          return (
            <button
              key={sub.value}
              type="button"
              onClick={() => toggle(sub.value)}
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

      {availableServices.length > 0 && (
  <div className="mt-6">
    <div className="mb-2 font-semibold text-sm text-text-muted">
      Services
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {availableServices.map((service) => {
        const isSelected =
          editedSubmission.services?.includes(service) || false;

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