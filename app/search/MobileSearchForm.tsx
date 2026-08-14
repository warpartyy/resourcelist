export default function MobileSearchForm({
  q,
  filters,
}: {
  q?: string;
  filters: Record<string, string | undefined>;
}) {
  return (
    <form action="/search" className="mb-3 lg:hidden">
      <input
        type="text"
        name="q"
        defaultValue={q ?? ""}
        placeholder="Search resources..."
        className="w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
      />
      {Object.entries(filters).map(([key, value]) =>
        value ? <input key={key} type="hidden" name={key} value={value} /> : null,
      )}
    </form>
  );
}
