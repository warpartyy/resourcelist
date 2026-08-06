import type { OpportunityReportItem } from "@/lib/services/resources/ai/intelligence/reporting/types";

export default function OpportunityCard({
  opportunity,
}: {
  opportunity: OpportunityReportItem;
}) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <h3 className="font-semibold text-text-primary">
        {opportunity.concept} in {opportunity.city}
      </h3>
      <p className="mt-1 text-sm text-text-muted">{opportunity.need}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Metric label="Searches" value={opportunity.searches.toString()} />
        <Metric label="Helpful" value={formatPercent(opportunity.helpfulRate)} />
        <Metric
          label="Avg Rec."
          value={opportunity.averageRecommendations.toFixed(1)}
        />
        <Metric
          label="Clarified"
          value={formatPercent(opportunity.clarificationRate)}
        />
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="font-semibold text-text-primary">{value}</p>
    </div>
  );
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
