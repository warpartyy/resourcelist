import type { ResourceDiscoveryQueueItem } from "@/lib/services/admin/resource-discovery/types";

type DiscoveryQueueProps = {
  items: ResourceDiscoveryQueueItem[];
  selectedItemId?: string;
  onSelect: (item: ResourceDiscoveryQueueItem) => void;
};

export default function DiscoveryQueue({
  items,
  selectedItemId,
  onSelect,
}: DiscoveryQueueProps) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">
          Discovery Queue
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Prioritized from existing Directory Coverage gap scores.
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
                <th className="py-3 pl-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={
                    item.id === selectedItemId ? "bg-teal-50/70" : undefined
                  }
                >
                  <td className="py-3 pr-4 font-semibold text-text-primary">
                    {item.priority}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => onSelect(item)}
                      className="font-medium text-teal-700 hover:text-teal-900"
                    >
                      {item.subcategory}
                    </button>
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
                    <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                      {item.status}
                    </span>
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
