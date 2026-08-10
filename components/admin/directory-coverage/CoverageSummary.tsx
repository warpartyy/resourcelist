import type { DirectoryCoverageSummary } from "@/lib/services/admin/directory-coverage/types";

export default function CoverageSummary({
  summary,
}: {
  summary: DirectoryCoverageSummary;
}) {
  const cards = [
    ["Approved Resources", summary.approvedResources],
    ["Service Assignments", summary.totalServiceAssignments],
    ["Unique Subcategories", summary.uniqueSubcategories],
    ["Avg. Per Subcategory", summary.averageResourcesPerSubcategory],
    ["Most Covered", summary.mostCoveredCategory ?? "None"],
    ["Least Covered", summary.leastCoveredCategory ?? "None"],
    ["Highest Demand", summary.highestDemandCategory ?? "None"],
    ["Highest Gap Score", summary.highestGapScore],
  ];

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, value]) => (
        <div
          key={label}
          className="rounded-xl border border-border bg-surface p-4 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {label}
          </p>
          <p className="mt-2 text-xl font-semibold text-text-primary">{value}</p>
        </div>
      ))}
    </section>
  );
}
