import type { ResourceCandidateSelection } from "@/lib/services/resources/intelligence/searchEngine";
import type { RequestUnderstanding } from "@/lib/services/resources/intelligence/request-understanding/types";

type Props = {
  normalizedQuery: string;
  detectedNeeds: string[];
  expandedTerms: string[];
  requestUnderstanding: RequestUnderstanding;
  candidateSelection: ResourceCandidateSelection;
};

export default function SearchLabSummary({
  normalizedQuery,
  detectedNeeds,
  expandedTerms,
  requestUnderstanding,
  candidateSelection,
}: Props) {
  const locationItems = [
    requestUnderstanding.location.city
      ? `City: ${requestUnderstanding.location.city}`
      : null,
    requestUnderstanding.location.county
      ? `County: ${requestUnderstanding.location.county}`
      : null,
    requestUnderstanding.location.state
      ? `State: ${requestUnderstanding.location.state}`
      : null,
  ].filter((item): item is string => Boolean(item));

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

      <SummaryPanel title="Request understanding">
        <div className="space-y-2">
          <p className="text-sm text-text-primary">
            Primary:{" "}
            <span className="font-semibold">
              {requestUnderstanding.primaryNeed
                ? formatIntentLabel(requestUnderstanding.primaryNeed)
                : "None"}
            </span>
          </p>
          <TokenList
            items={requestUnderstanding.secondaryNeeds.map(formatIntentLabel)}
            emptyLabel="No secondary needs"
          />
        </div>
      </SummaryPanel>

      <SummaryPanel title="Intent confidence">
        {requestUnderstanding.intentConfidence.length === 0 ? (
          <p className="text-sm text-text-muted">No weighted intents</p>
        ) : (
          <div className="space-y-2">
            {requestUnderstanding.intentConfidence.map((intent) => (
              <div
                key={intent.need}
                className="rounded-md border border-border bg-bg px-2 py-1.5"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-text-primary">
                    {formatIntentLabel(intent.need)}
                  </span>
                  <span className="text-text-muted">
                    {Math.round(intent.confidence * 100)}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-text-muted">
                  {intent.matchedPhrases.join(", ")}
                </p>
              </div>
            ))}
          </div>
        )}
      </SummaryPanel>

      <SummaryPanel title="Location / urgency">
        <div className="space-y-3">
          <TokenList items={locationItems} emptyLabel="No location detected" />
          <div>
            <p className="text-sm font-semibold text-text-primary">
              {formatIntentLabel(requestUnderstanding.urgency.level)}
            </p>
            <TokenList
              items={requestUnderstanding.urgency.matchedTerms}
              emptyLabel="No urgency signals"
            />
          </div>
        </div>
      </SummaryPanel>

      <SummaryPanel title="Situation detection">
        {requestUnderstanding.situations.length === 0 ? (
          <p className="text-sm text-text-muted">No situations detected</p>
        ) : (
          <div className="space-y-3">
            {requestUnderstanding.situations.map((situation) => (
              <div
                key={situation.id}
                className="rounded-md border border-border bg-bg px-2 py-2"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-text-primary">
                    {situation.label}
                  </span>
                  <span className="text-text-muted">
                    {situation.confidence.toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 space-y-2">
                  <TokenList
                    items={situation.matchedTerms}
                    emptyLabel="No matched terms"
                  />
                  <TokenList
                    items={situation.derivedNeeds}
                    emptyLabel="No derived needs"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </SummaryPanel>

      <SummaryPanel title="Derived needs">
        <TokenList
          items={requestUnderstanding.derivedNeeds}
          emptyLabel="No derived needs"
        />
        <div className="mt-3">
          <TokenList
            items={requestUnderstanding.matchedSituationTerms}
            emptyLabel="No matched situation terms"
          />
        </div>
        <p className="mt-3 text-xs text-text-muted">
          Situation confidence:{" "}
          {requestUnderstanding.situationConfidence.toFixed(2)}
        </p>
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
