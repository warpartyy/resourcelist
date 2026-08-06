import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingState from "./LoadingState";
import { BarRow, formatLabel } from "./NeedsChart";
import type { ConceptReportItem } from "@/lib/hooks/resource-guide-intelligence/types";

type ConceptsChartProps = {
  data: ConceptReportItem[] | null;
  isLoading: boolean;
  error: string | null;
};

export default function ConceptsChart({
  data,
  isLoading,
  error,
}: ConceptsChartProps) {
  if (isLoading) return <LoadingState label="Loading search concepts" />;
  if (error) return <ErrorState message={error} />;
  if (!data?.length) return <EmptyState />;

  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <h3 className="text-lg font-semibold">Search Concepts</h3>
      <div className="mt-4 space-y-3">
        {data.slice(0, 10).map((item) => (
          <BarRow
            key={item.concept}
            label={formatLabel(item.concept)}
            count={item.count}
            max={max}
          />
        ))}
      </div>
    </section>
  );
}
