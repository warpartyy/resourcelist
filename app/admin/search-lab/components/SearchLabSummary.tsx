import type { ResourceCandidateSelection } from "@/lib/services/resources/intelligence/searchEngine";

type Props = {
  normalizedQuery: string;
  detectedNeeds: string[];
  expandedTerms: string[];
  candidateSelection: ResourceCandidateSelection;
};

export default function SearchLabSummary({
  normalizedQuery,
  detectedNeeds,
  expandedTerms,
  candidateSelection,
}: Props) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <SummaryPanel title="Normalized query">
        <p className="text-sm text-text-primary">
          {normalizedQuery || "No query entered"}
        </p>
      </SummaryPanel>

      <SummaryPanel title="Detected intent">
        <TokenList
          items={detectedNeeds.map(formatIntentLabel)}
          emptyLabel="None detected"
        />
      </SummaryPanel>

      <SummaryPanel title="Expanded terms">
        <TokenList items={expandedTerms} emptyLabel="No terms" />
      </SummaryPanel>

      <SummaryPanel title="Candidate resources">
        <p className="text-sm font-semibold text-text-primary">
          {candidateSelection.candidateResourceCount}
        </p>
      </SummaryPanel>

      <SummaryPanel title="Candidate filter">
        <p className="text-sm text-text-primary">
          {candidateSelection.candidateFilter}
        </p>
      </SummaryPanel>

      <SummaryPanel title="Expanded search">
        <p className="text-sm font-semibold text-text-primary">
          {candidateSelection.expandedSearch ? "Yes" : "No"}
        </p>
        {candidateSelection.reason ? (
          <p className="mt-2 text-sm text-text-muted">
            {candidateSelection.reason}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-text-muted">
          {formatRecommendationMode(candidateSelection.recommendationMode)}
        </p>
      </SummaryPanel>
    </section>
  );
}

function formatIntentLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatRecommendationMode(
  value: ResourceCandidateSelection["recommendationMode"]
): string {
  if (value === "fallback_recommendation") {
    return "Fallback Recommendation";
  }

  if (value === "intent_candidates") {
    return "Intent candidates";
  }

  return "Unfiltered";
}

function SummaryPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function TokenList({
  items,
  emptyLabel,
}: {
  items: string[];
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-text-muted">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-border bg-bg px-2 py-1 text-xs text-text-muted"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
