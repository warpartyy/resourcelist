"use client";

import type { IntelligenceDashboardFilters } from "@/lib/hooks/resource-guide-intelligence/types";

type FiltersBarProps = {
  filters: IntelligenceDashboardFilters;
  onChange: (filters: IntelligenceDashboardFilters) => void;
};

const DATE_RANGES = [
  { label: "All", value: "all" },
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
] as const;

export default function FiltersBar({ filters, onChange }: FiltersBarProps) {
  const updateFilter = (
    key: keyof IntelligenceDashboardFilters,
    value: string
  ) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm font-medium text-text-primary">
          Date Range
          <select
            value={filters.dateRange}
            onChange={(event) => updateFilter("dateRange", event.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
          >
            {DATE_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </label>
        <FilterInput label="State" value={filters.state} onChange={(value) => updateFilter("state", value)} />
        <FilterInput label="County" value={filters.county} onChange={(value) => updateFilter("county", value)} />
        <FilterInput label="City" value={filters.city} onChange={(value) => updateFilter("city", value)} />
        <FilterInput label="Need" value={filters.need} onChange={(value) => updateFilter("need", value)} />
        <FilterInput label="Concept" value={filters.concept} onChange={(value) => updateFilter("concept", value)} />
        <FilterInput label="Prompt Version" value={filters.promptVersion} onChange={(value) => updateFilter("promptVersion", value)} />
        <div className="flex items-end">
          <button
            type="button"
            onClick={() =>
              onChange({
                dateRange: "30d",
                state: "",
                county: "",
                city: "",
                need: "",
                concept: "",
                promptVersion: "",
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
        className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
        placeholder={label}
      />
    </label>
  );
}
