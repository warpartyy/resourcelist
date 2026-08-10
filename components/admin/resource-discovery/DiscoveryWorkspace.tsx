import type { ResourceDiscoveryQueueItem } from "@/lib/services/admin/resource-discovery/types";

export default function DiscoveryWorkspace({
  selectedItem,
}: {
  selectedItem: ResourceDiscoveryQueueItem | null;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-text-primary">
        Discovery Workspace
      </h2>
      {!selectedItem ? (
        <p className="mt-3 text-sm text-text-muted">
          Select a queue item to inspect the coverage gap before future research.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Metric label="Selected Geography" value={selectedItem.geography} />
          <Metric
            label="Selected Service Category"
            value={selectedItem.subcategory}
          />
          <Metric label="Gap Score" value={selectedItem.gapScore} />
          <Metric label="Resource Count" value={selectedItem.resourceCount} />
          <Metric label="Search Demand" value={selectedItem.searchDemand} />
          <Metric
            label="Helpful Rate"
            value={`${Math.round(selectedItem.helpfulRate * 100)}%`}
          />
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-bg p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-text-primary">{value}</p>
    </div>
  );
}
