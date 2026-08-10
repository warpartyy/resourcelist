import type { DirectoryHealthScore } from "@/lib/services/admin/directory-coverage/types";

export default function DirectoryHealthPanel({
  health,
}: {
  health: DirectoryHealthScore;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-teal-700">
            Directory Health
          </p>
          <h3 className="mt-1 text-3xl font-semibold text-text-primary">
            {health.score} / 100
          </h3>
          <p className="mt-1 text-sm font-medium text-text-muted">
            {health.level}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <HealthMetric label="Coverage" value={health.coverage} />
          <HealthMetric label="Demand Match" value={health.demandMatch} />
          <HealthMetric
            label="Geographic Coverage"
            value={health.geographicCoverage}
          />
        </div>
      </div>
    </section>
  );
}

function HealthMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-text-primary">{value}</p>
    </div>
  );
}
