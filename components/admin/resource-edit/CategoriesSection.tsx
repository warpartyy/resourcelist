import { SUBCATEGORIES } from "@/lib/taxonomy";

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

      return {
        ...prev,
        subcategories: updated,
      };
    });
  };

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
    </div>
  );
}