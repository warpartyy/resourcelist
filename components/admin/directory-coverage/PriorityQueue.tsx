import type { PriorityQueueItem } from "@/lib/services/admin/directory-coverage/types";

export default function PriorityQueue({
  items,
}: {
  items: PriorityQueueItem[];
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-text-primary">
        Recruitment Priority Queue
      </h3>
      <p className="mt-1 text-sm text-text-muted">
        Top county-level opportunities ranked by deterministic gap score.
      </p>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-text-muted">No priorities available.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="py-3 pr-4">Priority</th>
                <th className="px-3 py-3">Service</th>
                <th className="px-3 py-3">County</th>
                <th className="px-3 py-3">Gap Score</th>
                <th className="py-3 pl-3">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={`${item.priority}-${item.service}-${item.county}`}>
                  <td className="py-3 pr-4 font-semibold text-text-primary">
                    {item.priority}
                  </td>
                  <td className="px-3 py-3 text-text-primary">{item.service}</td>
                  <td className="px-3 py-3 text-text-muted">{item.county}</td>
                  <td className="px-3 py-3 font-semibold text-text-primary">
                    {item.gapScore}
                  </td>
                  <td className="py-3 pl-3 text-text-muted">{item.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
