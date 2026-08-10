import type { ParentCategoryRollup } from "@/lib/services/admin/directory-coverage/types";

export default function ParentCategoryRollups({
  rollups,
  onSelect,
}: {
  rollups: ParentCategoryRollup[];
  onSelect: (parentCategory: string) => void;
}) {
  if (rollups.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-text-primary">
          Parent Category Rollups
        </h3>
        <p className="mt-1 text-sm text-text-muted">
          Click a category to focus the dashboard on its subcategories.
        </p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rollups.map((rollup) => (
          <button
            key={rollup.parentCategory}
            type="button"
            onClick={() => onSelect(rollup.parentCategory)}
            className="rounded-lg border border-border bg-bg p-4 text-left transition hover:border-teal-300 hover:bg-teal-50"
          >
            <p className="font-semibold text-text-primary">
              {rollup.parentCategory}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <Metric label="Resources" value={rollup.resources} />
              <Metric label="Subcategories" value={rollup.subcategories} />
              <Metric
                label="Helpful"
                value={`${Math.round(rollup.averageHelpfulRate * 100)}%`}
              />
              <Metric label="Avg Gap" value={rollup.averageGapScore} />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="font-semibold text-text-primary">{value}</p>
    </div>
  );
}
