import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingState from "./LoadingState";
import type { OverviewReport } from "@/lib/hooks/resource-guide-intelligence/types";

type OverviewCardsProps = {
  data: OverviewReport | null;
  isLoading: boolean;
  error: string | null;
};

export default function OverviewCards({ data, isLoading, error }: OverviewCardsProps) {
  if (isLoading) return <LoadingState label="Loading overview" />;
  if (error) return <ErrorState message={error} />;
  if (!data) return <EmptyState />;

  const cards = [
    { label: "Conversations", value: data.conversationCount.toLocaleString() },
    { label: "Helpful Rate", value: formatPercent(data.helpfulRate) },
    { label: "Clarification Rate", value: formatPercent(getClarificationRate(data)) },
    {
      label: "Avg Response Time",
      value: `${Math.round(data.averageResponseTimeMs).toLocaleString()} ms`,
    },
    {
      label: "Avg Recommendations",
      value: data.averageRecommendationCount.toFixed(1),
    },
  ];

  return (
    <section aria-labelledby="overview-heading" className="space-y-3">
      <h3 id="overview-heading" className="text-lg font-semibold">
        Overview
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-xl border border-border bg-surface p-4 shadow-sm"
          >
            <p className="text-sm text-text-muted">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">
              {card.value}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function getClarificationRate(data: OverviewReport): number {
  const total = data.answerCount + data.clarificationCount;
  return total > 0 ? data.clarificationCount / total : 0;
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
