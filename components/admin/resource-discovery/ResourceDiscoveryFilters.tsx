import type { ResourceDiscoveryFilters } from "@/lib/services/admin/resource-discovery/types";

type ResourceDiscoveryFiltersProps = {
  filters: ResourceDiscoveryFilters;
  onChange: (filters: ResourceDiscoveryFilters) => void;
};

const DATE_RANGES = [
  { label: "All", value: "all" },
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
] as const;

export default function ResourceDiscoveryFilters({
  filters,
  onChange,
}: ResourceDiscoveryFiltersProps) {
  const update = (key: keyof ResourceDiscoveryFilters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
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
        <FilterInput
          label="Subcategory"
          value={filters.subcategory}
          onChange={(value) => update("subcategory", value)}
        />
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
