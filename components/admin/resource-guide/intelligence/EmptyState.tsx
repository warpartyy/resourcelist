export default function EmptyState({
  message = "No intelligence data matches the current filters.",
}: {
  message?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-bg p-4 text-sm text-text-muted">
      {message}
    </div>
  );
}
