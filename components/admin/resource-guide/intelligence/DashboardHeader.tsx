export default function DashboardHeader() {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium uppercase tracking-wide text-accent">
        Resource Guide Intelligence
      </p>
      <div className="max-w-3xl space-y-2">
        <h2 className="text-2xl font-semibold text-text-primary md:text-3xl">
          Privacy-conscious search and recommendation insights
        </h2>
        <p className="text-sm leading-6 text-text-muted">
          Monitor what people need, where demand is emerging, how resources perform,
          and which searches need directory or search improvements.
        </p>
      </div>
    </div>
  );
}
