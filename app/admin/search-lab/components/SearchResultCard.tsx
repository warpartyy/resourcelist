import type {
  ResourceSearchResult,
  ResourceSearchReason,
} from "@/lib/services/resources/intelligence/searchEngine";
import type { ResourceSearchField } from "@/lib/services/resources/intelligence/types";

const FIELD_LABELS: Record<ResourceSearchField, string> = {
  organization: "Organization matched",
  city: "City matched",
  services: "Services matched",
  tags: "Tags matched",
  subcategories: "Subcategories matched",
  parent_categories: "Parent categories matched",
  description: "Description matched",
  eligibility: "Eligibility matched",
  tribal_eligibility: "Tribal eligibility matched",
  counties_served: "Counties matched",
};

const CONFIDENCE_STYLES = {
  high: "border-green-500/30 bg-green-500/10 text-green-700",
  medium: "border-yellow-500/30 bg-yellow-500/10 text-yellow-700",
  low: "border-border bg-bg text-text-muted",
};

export default function SearchResultCard({
  result,
  rank,
}: {
  result: ResourceSearchResult;
  rank: number;
}) {
  const { resource, score, confidence, reasons } = result;

  return (
    <article className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase text-text-muted">
            Result {rank}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-text-primary">
            {resource.organization || "Unnamed resource"}
          </h2>
          {resource.description && (
            <p className="mt-2 max-w-3xl text-sm text-text-muted">
              {resource.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full border border-border bg-bg px-3 py-1 text-sm font-semibold text-text-primary">
            {score}
          </span>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${CONFIDENCE_STYLES[confidence]}`}
          >
            {confidence}
          </span>
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-text-primary">Reasons</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {reasons.map((reason) => (
            <ReasonItem key={`${reason.field}-${reason.matchedValue}`} reason={reason} />
          ))}
        </div>
      </div>
    </article>
  );
}

function ReasonItem({ reason }: { reason: ResourceSearchReason }) {
  return (
    <div className="rounded-lg border border-border bg-bg p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-text-primary">
          {FIELD_LABELS[reason.field]}
        </p>
        <span className="text-sm font-semibold text-accent">+{reason.points}</span>
      </div>
      <p className="mt-2 text-sm text-text-muted">{reason.matchedValue}</p>
    </div>
  );
}
