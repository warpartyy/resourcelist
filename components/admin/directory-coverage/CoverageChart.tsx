import type {
  CoverageItem,
  CoverageLevel,
} from "@/lib/services/admin/directory-coverage/types";

const LEVEL_STYLES: Record<CoverageLevel, string> = {
  Excellent: "bg-emerald-600",
  Strong: "bg-teal-600",
  Moderate: "bg-sky-600",
  "Needs Growth": "bg-amber-500",
  "Critical Gap": "bg-red-500",
};

export default function CoverageChart({ coverage }: { coverage: CoverageItem[] }) {
  if (coverage.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-text-primary">
          Coverage by Subcategory
        </h3>
        <p className="mt-2 text-sm text-text-muted">
          No approved resource subcategories were found.
        </p>
      </section>
    );
  }

  const max = Math.max(...coverage.map((item) => item.resourceCount), 1);

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Coverage by Subcategory
          </h3>
          <p className="text-sm text-text-muted">
            Approved resources contributing to each service area.
          </p>
        </div>
        <p className="text-xs text-text-muted">
          Levels: Excellent 100+, Strong 50-99, Moderate 20-49, Needs Growth
          10-19, Critical Gap 0-9
        </p>
      </div>
      <div className="mt-5 space-y-3">
        {coverage.map((item) => (
          <div
            key={item.subcategory}
            className="grid gap-2 md:grid-cols-[180px_1fr_96px]"
          >
            <span className="text-sm font-medium text-text-primary">
              {item.subcategory}
            </span>
            <div className="h-4 overflow-hidden rounded-full bg-bg">
              <div
                className={`h-full rounded-full ${LEVEL_STYLES[item.coverageLevel]}`}
                style={{
                  width: `${Math.max(3, (item.resourceCount / max) * 100)}%`,
                }}
              />
            </div>
            <span className="text-sm text-text-muted md:text-right">
              {item.resourceCount}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
