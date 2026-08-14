import type { ResourceDiscoverySessionSummary } from "@/lib/services/admin/resource-discovery/types";

type RecentResearchPanelProps = {
  sessions: ResourceDiscoverySessionSummary[];
  selectedSessionId?: string | null;
  isLoading?: boolean;
  onSelect: (session: ResourceDiscoverySessionSummary) => void;
};

export default function RecentResearchPanel({
  sessions,
  selectedSessionId,
  isLoading = false,
  onSelect,
}: RecentResearchPanelProps) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-text-primary">Recent Research</h2>
      <p className="mt-1 text-sm text-text-muted">
        Reopen completed sessions without running AI again.
      </p>

      {isLoading ? (
        <p className="mt-4 text-sm text-text-muted">Loading recent research...</p>
      ) : null}

      {!isLoading && sessions.length === 0 ? (
        <p className="mt-4 text-sm text-text-muted">
          No completed research sessions yet.
        </p>
      ) : null}

      {!isLoading && sessions.length > 0 ? (
        <div className="mt-4 space-y-2">
          {sessions.map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => onSelect(session)}
              className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                selectedSessionId === session.id
                  ? "border-teal-200 bg-teal-50 text-teal-900"
                  : "border-border bg-bg text-text-primary hover:bg-teal-50"
              }`}
            >
              <span className="block text-sm font-medium">
                {session.subcategory || session.parentCategory}
              </span>
              <span className="mt-0.5 block text-xs text-text-muted">
                {[session.city, session.county, session.state].filter(Boolean).join(", ")}
              </span>
              <span className="mt-0.5 block text-xs text-text-muted">
                {formatDate(session.completedAt ?? session.createdAt)}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
