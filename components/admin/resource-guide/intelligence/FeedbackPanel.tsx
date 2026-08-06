import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingState from "./LoadingState";
import type { FeedbackReport } from "@/lib/hooks/resource-guide-intelligence/types";

type FeedbackPanelProps = {
  data: FeedbackReport | null;
  isLoading: boolean;
  error: string | null;
};

export default function FeedbackPanel({ data, isLoading, error }: FeedbackPanelProps) {
  if (isLoading) return <LoadingState label="Loading feedback insights" />;
  if (error) return <ErrorState message={error} />;
  if (!data) return <EmptyState />;

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Feedback Insights</h3>
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <FeedbackRateCard label="Helpful" value={data.helpfulRate} />
          <FeedbackRateCard label="Not Helpful" value={data.notHelpfulRate} />
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          <FeedbackList
            title="Positive Feedback"
            rows={data.positiveSelections.map((item) => ({
              label: item.selection,
              count: item.count,
            }))}
          />
          <FeedbackList
            title="Negative Feedback"
            rows={data.negativeSelections.map((item) => ({
              label: item.selection,
              count: item.count,
            }))}
          />
          <FeedbackList
            title="Other Responses"
            rows={data.otherResponses.map((item) => ({
              label: item.response,
              count: item.count,
            }))}
          />
        </div>
      </div>
    </section>
  );
}

function FeedbackRateCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <p className="text-sm text-text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{formatPercent(value)}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg">
        <div className="h-full rounded-full bg-accent" style={{ width: `${value * 100}%` }} />
      </div>
    </article>
  );
}

function FeedbackList({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; count: number }>;
}) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <h4 className="font-semibold">{title}</h4>
      {rows.length === 0 ? (
        <div className="mt-3">
          <EmptyState />
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.slice(0, 8).map((row) => (
            <li key={row.label} className="flex justify-between gap-3 text-sm">
              <span className="text-text-primary">{formatLabel(row.label)}</span>
              <span className="text-text-muted">{row.count}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatLabel(value: string): string {
  return value.replace(/_/g, " ");
}
