import type { ResourceDiscoveryQueueItem } from "@/lib/services/admin/resource-discovery/types";

type DiscoveryQueueProps = {
  items: ResourceDiscoveryQueueItem[];
  onUseSearch: (item: ResourceDiscoveryQueueItem) => void;
};

export default function DiscoveryQueue({
  items,
  onUseSearch,
}: DiscoveryQueueProps) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">
          Community Insights
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Prioritized from Directory Coverage. These insights can pre-fill a
          search, but they never start AI research automatically.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-text-muted">
          No coverage gaps match the current filters.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="py-3 pr-4">Priority</th>
                <th className="px-3 py-3">Subcategory</th>
                <th className="px-3 py-3">Geography</th>
                <th className="px-3 py-3">Gap Score</th>
                <th className="px-3 py-3">Search Demand</th>
                <th className="py-3 pl-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 pr-4 font-semibold text-text-primary">
                    {item.priority}
                  </td>
                  <td className="px-3 py-3">
                    <span className="font-medium text-text-primary">
                      {item.subcategory}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-text-muted">
                    {item.geography}
                  </td>
                  <td className="px-3 py-3 font-semibold text-text-primary">
                    {item.gapScore}
                  </td>
                  <td className="px-3 py-3 text-text-muted">
                    {item.searchDemand}
                  </td>
                  <td className="py-3 pl-3">
                    <button
                      type="button"
                      onClick={() => onUseSearch(item)}
                      className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-800 transition-colors hover:bg-teal-100"
                    >
                      Use This Search
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
