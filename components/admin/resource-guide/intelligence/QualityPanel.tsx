import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingState from "./LoadingState";
import type { QualityReport } from "@/lib/hooks/resource-guide-intelligence/types";

type QualityPanelProps = {
  data: QualityReport | null;
  isLoading: boolean;
  error: string | null;
};

export default function QualityPanel({ data, isLoading, error }: QualityPanelProps) {
  if (isLoading) return <LoadingState label="Loading search quality" />;
  if (error) return <ErrorState message={error} />;
  if (!data) return <EmptyState />;

  const cards = [
    { label: "Clarification Rate", value: formatPercent(data.clarificationRate), progress: data.clarificationRate },
    { label: "Validation Pass Rate", value: formatPercent(data.validationPassRate), progress: data.validationPassRate },
    { label: "Avg Candidate Count", value: data.averageCandidateCount.toFixed(1) },
    { label: "Avg High Confidence", value: data.averageHighConfidenceCount.toFixed(1) },
    { label: "Avg Recommendation Count", value: data.averageResourceCount.toFixed(1) },
  ];

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Search Quality</h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <article key={card.label} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <p className="text-sm text-text-muted">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
            {card.progress !== undefined ? (
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg">
                <div className="h-full rounded-full bg-accent" style={{ width: `${card.progress * 100}%` }} />
              </div>
            ) : null}
          </article>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <MetricList title="Selection Tier Usage" rows={data.selectionTierUsage} />
        <MetricList title="Recommendation Modes" rows={data.recommendationModes} />
        <MetricList title="Validation Issue Counts" rows={data.validationIssues} />
      </div>
    </section>
  );
}

function MetricList({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ name: string; count: number }>;
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
          {rows.map((row) => (
            <li key={row.name} className="flex justify-between gap-3 text-sm">
              <span>{row.name.replace(/_/g, " ")}</span>
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
