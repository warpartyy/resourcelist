import type { CoverageDashboardFilters } from "./CoverageDashboard";

type CoverageFiltersProps = {
  filters: CoverageDashboardFilters;
  onChange: (filters: CoverageDashboardFilters) => void;
};

const DATE_RANGES = [
  { label: "All", value: "all" },
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
] as const;

const SORT_OPTIONS = [
  { label: "Gap Score", value: "gapScore" },
  { label: "Resource Count", value: "resourceCount" },
  { label: "Search Count", value: "searchCount" },
  { label: "Helpful Rate", value: "helpfulRate" },
  { label: "Alphabetical", value: "alphabetical" },
] as const;

export default function CoverageFilters({
  filters,
  onChange,
}: CoverageFiltersProps) {
  const update = (key: keyof CoverageDashboardFilters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm font-medium text-text-primary">
          Date Range
          <select
            value={filters.dateRange}
            onChange={(event) => update("dateRange", event.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
          >
            {DATE_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </label>
        <FilterInput
          label="State"
          value={filters.state}
          onChange={(value) => update("state", value)}
        />
        <FilterInput
          label="County"
          value={filters.county}
          onChange={(value) => update("county", value)}
        />
        <FilterInput
          label="City"
          value={filters.city}
          onChange={(value) => update("city", value)}
        />
        <FilterInput
          label="Parent Category"
          value={filters.parentCategory}
          onChange={(value) => update("parentCategory", value)}
        />
        <label className="text-sm font-medium text-text-primary">
          Sort
          <select
            value={filters.sort}
            onChange={(event) => update("sort", event.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-text-primary">
          Direction
          <select
            value={filters.direction}
            onChange={(event) => update("direction", event.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() =>
              onChange({
                dateRange: "30d",
                state: "",
                county: "",
                city: "",
                parentCategory: "",
                sort: "gapScore",
                direction: "desc",
              })
            }
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm font-medium text-text-primary hover:border-accent"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </section>
  );
}

function FilterInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm font-medium text-text-primary">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
      />
    </label>
  );
}
