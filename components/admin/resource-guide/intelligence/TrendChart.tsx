"use client";

import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingState from "./LoadingState";
import type { TrendsReport } from "@/lib/hooks/resource-guide-intelligence/types";

type TrendChartProps = {
  data: TrendsReport | null;
  isLoading: boolean;
  error: string | null;
};

const SERIES = [
  { key: "conversationCount", label: "Conversations" },
  { key: "helpfulRate", label: "Helpful Rate" },
  { key: "clarificationRate", label: "Clarification Rate" },
  { key: "averageResponseTimeMs", label: "Response Time" },
  { key: "averageRecommendationCount", label: "Recommendation Count" },
] as const;

export default function TrendChart({ data, isLoading, error }: TrendChartProps) {
  if (isLoading) return <LoadingState label="Loading trends" />;
  if (error) return <ErrorState message={error} />;
  if (!data?.days.length) return <EmptyState />;

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Trends</h3>
      <div className="grid gap-4 xl:grid-cols-2">
        {SERIES.map((series) => (
          <article key={series.key} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <h4 className="font-semibold">{series.label}</h4>
            <LineChart
              values={data.days.map((day) => day[series.key])}
              labels={data.days.map((day) => day.date)}
            />
          </article>
        ))}
      </div>
    </section>
  );
}

function LineChart({ values, labels }: { values: number[]; labels: string[] }) {
  const width = 360;
  const height = 120;
  const padding = 14;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = Math.max(max - min, 1);
  const points = values.map((value, index) => {
    const x =
      values.length === 1
        ? width / 2
        : padding + (index / (values.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / span) * (height - padding * 2);
    return `${x},${y}`;
  });

  return (
    <div className="mt-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${labels[0]} to ${labels[labels.length - 1]} trend`}
        className="h-36 w-full"
        preserveAspectRatio="none"
      >
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-accent"
          points={points.join(" ")}
        />
        {points.map((point) => {
          const [x, y] = point.split(",");
          return <circle key={point} cx={x} cy={y} r="3" className="fill-accent" />;
        })}
      </svg>
      <div className="flex justify-between text-xs text-text-muted">
        <span>{labels[0]}</span>
        <span>{labels[labels.length - 1]}</span>
      </div>
    </div>
  );
}
