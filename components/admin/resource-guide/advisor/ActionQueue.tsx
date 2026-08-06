import EmptyState from "./EmptyState";
import PriorityBadge from "./PriorityBadge";
import type { AdvisorRecommendation } from "@/lib/services/resources/ai/advisor/types";

export default function ActionQueue({
  recommendations,
}: {
  recommendations: AdvisorRecommendation[];
}) {
  if (recommendations.length === 0) {
    return <EmptyState message="No action items are currently recommended." />;
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Action Queue</h2>
      <div className="mt-4 divide-y divide-border">
        {recommendations.slice(0, 8).map((recommendation) => (
          <article
            key={recommendation.id}
            className="grid gap-3 py-4 first:pt-0 last:pb-0 md:grid-cols-[120px_1fr]"
          >
            <PriorityBadge priority={recommendation.priority} />
            <div>
              <h3 className="font-semibold text-text-primary">
                {recommendation.title}
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                {recommendation.reason}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
