export default function LoadingState({ label = "Loading report" }: { label?: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 text-sm text-text-muted">
      {label}...
    </div>
  );
}
