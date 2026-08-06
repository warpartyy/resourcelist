type Props = {
  normalizedQuery: string;
  detectedNeeds: string[];
  expandedTerms: string[];
};

export default function SearchLabSummary({
  normalizedQuery,
  detectedNeeds,
  expandedTerms,
}: Props) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <SummaryPanel title="Normalized query">
        <p className="text-sm text-text-primary">
          {normalizedQuery || "No query entered"}
        </p>
      </SummaryPanel>

      <SummaryPanel title="Detected needs">
        <TokenList items={detectedNeeds} emptyLabel="None detected" />
      </SummaryPanel>

      <SummaryPanel title="Expanded terms">
        <TokenList items={expandedTerms} emptyLabel="No terms" />
      </SummaryPanel>
    </section>
  );
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
