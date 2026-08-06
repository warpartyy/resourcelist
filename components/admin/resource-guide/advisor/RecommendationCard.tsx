import PriorityBadge from "./PriorityBadge";
import type { AdvisorRecommendation } from "@/lib/services/resources/ai/advisor/types";

export default function RecommendationCard({
  recommendation,
}: {
  recommendation: AdvisorRecommendation;
}) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {recommendation.category.replace(/_/g, " ")}
          </p>
          <h3 className="mt-1 text-base font-semibold text-text-primary">
            {recommendation.title}
          </h3>
        </div>
        <PriorityBadge priority={recommendation.priority} />
      </div>
      <p className="mt-3 text-sm leading-6 text-text-muted">
        {recommendation.description}
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-bg p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Reason
          </p>
          <p className="mt-1 text-sm text-text-primary">{recommendation.reason}</p>
        </div>
        <div className="rounded-lg border border-border bg-bg p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Recommended Action
          </p>
          <p className="mt-1 text-sm text-text-primary">
            {recommendation.recommendedAction}
          </p>
        </div>
      </div>
    </article>
  );
}
