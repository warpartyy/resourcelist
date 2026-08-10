import type { OpportunityHighlight } from "@/lib/services/admin/directory-coverage/types";

export default function OpportunityHighlights({
  highlights,
}: {
  highlights: OpportunityHighlight[];
}) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {highlights.map((highlight) => (
        <article
          key={highlight.label}
          className="rounded-xl border border-border bg-surface p-4 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {highlight.label}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-text-primary">
            {highlight.title}
          </h3>
          <p className="mt-1 text-sm font-semibold text-teal-700">
            {highlight.metric}
          </p>
          <p className="mt-2 text-xs leading-5 text-text-muted">
            {highlight.detail}
          </p>
        </article>
      ))}
    </section>
  );
}
