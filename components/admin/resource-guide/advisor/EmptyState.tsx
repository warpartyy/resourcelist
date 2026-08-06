export default function EmptyState({
  message = "No recommendations are available yet.",
}: {
  message?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-bg p-6 text-sm text-text-muted">
      {message}
    </div>
  );
}
