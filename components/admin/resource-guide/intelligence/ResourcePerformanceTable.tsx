import Link from "next/link";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingState from "./LoadingState";
import type {
  ResourcePerformanceItem,
  ResourcePerformanceReport,
} from "@/lib/hooks/resource-guide-intelligence/types";

type ResourcePerformanceTableProps = {
  data: ResourcePerformanceReport | null;
  isLoading: boolean;
  error: string | null;
};

export default function ResourcePerformanceTable({
  data,
  isLoading,
  error,
}: ResourcePerformanceTableProps) {
  if (isLoading) return <LoadingState label="Loading resource performance" />;
  if (error) return <ErrorState message={error} />;
  if (!data) return <EmptyState />;

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Resource Performance</h3>
      <div className="grid gap-4 xl:grid-cols-3">
        <PerformanceList title="Most Recommended" rows={data.mostRecommendedResources} />
        <PerformanceList title="Most Clicked" rows={data.mostClickedResources} />
        <PerformanceList title="Lowest Click Through Rate" rows={data.lowestClickThroughRate} />
      </div>
    </section>
  );
}

function PerformanceList({
  title,
  rows,
}: {
  title: string;
  rows: ResourcePerformanceItem[];
}) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <h4 className="font-semibold text-text-primary">{title}</h4>
      {rows.length === 0 ? (
        <div className="mt-3">
          <EmptyState />
        </div>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-text-muted">
              <tr className="border-b border-border">
                <th className="py-2 font-medium">Organization</th>
                <th className="py-2 text-right font-medium">Rec.</th>
                <th className="py-2 text-right font-medium">Clicks</th>
                <th className="py-2 text-right font-medium">CTR</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.resourceId} className="border-b border-border/60">
                  <td className="max-w-[180px] py-2">
                    <Link
                      href={`/admin?tab=resources&subtab=approved&resource=${row.resourceId}`}
                      className="font-medium text-text-primary hover:text-accent"
                    >
                      {row.organization}
                    </Link>
                  </td>
                  <td className="py-2 text-right text-text-muted">{row.recommendations}</td>
                  <td className="py-2 text-right text-text-muted">{row.clicks}</td>
                  <td className="py-2 text-right text-text-muted">{formatPercent(row.clickThroughRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
