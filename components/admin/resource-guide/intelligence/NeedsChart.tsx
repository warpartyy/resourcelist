import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingState from "./LoadingState";
import type { NeedReportItem } from "@/lib/hooks/resource-guide-intelligence/types";

type NeedsChartProps = {
  data: NeedReportItem[] | null;
  isLoading: boolean;
  error: string | null;
};

export default function NeedsChart({ data, isLoading, error }: NeedsChartProps) {
  if (isLoading) return <LoadingState label="Loading community needs" />;
  if (error) return <ErrorState message={error} />;
  if (!data?.length) return <EmptyState />;

  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <h3 className="text-lg font-semibold">Community Needs</h3>
      <div className="mt-4 space-y-3">
        {data.slice(0, 10).map((item) => (
          <BarRow
            key={item.need}
            label={formatLabel(item.need)}
            count={item.count}
            max={max}
          />
        ))}
      </div>
    </section>
  );
}

export function BarRow({
  label,
  count,
  max,
}: {
  label: string;
  count: number;
  max: number;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[150px_1fr_56px] sm:items-center">
      <span className="text-sm font-medium text-text-primary">{label}</span>
      <div className="h-3 overflow-hidden rounded-full bg-bg">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${Math.max(4, (count / max) * 100)}%` }}
        />
      </div>
      <span className="text-sm text-text-muted sm:text-right">{count}</span>
    </div>
  );
}

export function formatLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
