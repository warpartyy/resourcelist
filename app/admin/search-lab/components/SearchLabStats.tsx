import type { ResourceSearchResult } from "@/lib/services/resources/intelligence/searchEngine";

type Props = {
  totalResources: number;
  results: ResourceSearchResult[];
};

export default function SearchLabStats({ totalResources, results }: Props) {
  const high = results.filter((result) => result.confidence === "high").length;
  const medium = results.filter((result) => result.confidence === "medium").length;
  const low = results.filter((result) => result.confidence === "low").length;

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard label="Approved loaded" value={totalResources} />
      <StatCard label="Matching resources" value={results.length} />
      <StatCard label="High confidence" value={high} />
      <StatCard label="Medium confidence" value={medium} />
      <StatCard label="Low confidence" value={low} />
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-xs font-medium uppercase text-text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-text-primary">{value}</p>
    </div>
  );
}
