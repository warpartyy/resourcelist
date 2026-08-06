import type { AdvisorHealthItem } from "@/lib/services/resources/ai/advisor/types";

const STATUS_LABELS: Record<AdvisorHealthItem["status"], string> = {
  healthy: "Healthy",
  needs_attention: "Needs Attention",
  critical: "Critical",
};

const STATUS_STYLES: Record<AdvisorHealthItem["status"], string> = {
  healthy: "border-emerald-200 bg-emerald-50 text-emerald-700",
  needs_attention: "border-amber-200 bg-amber-50 text-amber-700",
  critical: "border-red-200 bg-red-50 text-red-700",
};

export default function HealthPanel({ items }: { items: AdvisorHealthItem[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">System Health</h2>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {items.map((item) => (
          <article
            key={item.area}
            className="rounded-xl border border-border bg-surface p-4 shadow-sm"
          >
            <p className="text-sm text-text-muted">{item.area}</p>
            <span
              className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[item.status]}`}
            >
              {STATUS_LABELS[item.status]}
            </span>
            <p className="mt-3 text-sm text-text-primary">{item.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
