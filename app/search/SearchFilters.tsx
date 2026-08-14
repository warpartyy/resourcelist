"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TRIBES } from "@/lib/tribes";
import {
  PARENT_CATEGORIES,
  SUBCATEGORIES,
  SUBCATEGORY_PARENT_MAP,
} from "@/lib/taxonomy";

export default function SearchFilters({
  forceOpen = false,
  onApply,
}: {
  forceOpen?: boolean;
  onApply?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [subcategories, setSubcategories] = useState(() =>
    readMultiValue(searchParams.get("sub")),
  );
  const [county, setCounty] = useState(searchParams.get("county") || "");
  const [state, setState] = useState(searchParams.get("state") || "");
  const [tribe, setTribe] = useState(searchParams.get("tribe") || "");
  const [tribeDropdownOpen, setTribeDropdownOpen] = useState(false);
  const [activeTribeIndex, setActiveTribeIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [open, setOpen] = useState(forceOpen);

  const groupedSubcategories = useMemo(() => buildServiceGroups(), []);
  const filteredTribes = useMemo(() => {
    const query = tribe.trim().toLowerCase();

    if (!query) {
      return TRIBES;
    }

    return TRIBES.filter((item) => item.toLowerCase().includes(query));
  }, [tribe]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("parent");
    setOrDelete(params, "sub", subcategories.join(","));
    setOrDelete(params, "county", county);
    setOrDelete(params, "state", state);
    setOrDelete(params, "tribe", tribe);
    params.delete("tribal");

    router.push(`${pathname}?${params.toString()}`);
    onApply?.();
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const toggleSubcategory = (value: string) => {
    setSubcategories((current) =>
      current.includes(value)
        ? current.filter((subcategory) => subcategory !== value)
        : [...current, value],
    );
  };

  const toggleSection = (value: string) => {
    setExpandedSections((current) =>
      current.includes(value)
        ? current.filter((section) => section !== value)
        : [...current, value],
    );
  };

  const selectTribe = (value: string) => {
    setTribe(value);
    setTribeDropdownOpen(false);
    setActiveTribeIndex(0);
  };

  const handleTribeKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!tribeDropdownOpen && event.key !== "Tab") {
      setTribeDropdownOpen(true);
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveTribeIndex((current) =>
        filteredTribes.length > 0 ? (current + 1) % filteredTribes.length : 0,
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveTribeIndex((current) =>
        filteredTribes.length > 0
          ? (current - 1 + filteredTribes.length) % filteredTribes.length
          : 0,
      );
    }

    if (event.key === "Enter" && tribeDropdownOpen && filteredTribes[activeTribeIndex]) {
      event.preventDefault();
      selectTribe(filteredTribes[activeTribeIndex]);
    }

    if (event.key === "Escape") {
      setTribeDropdownOpen(false);
    }
  };

  return (
    <div
      className={
        forceOpen
          ? "bg-bg"
          : "overflow-hidden rounded-2xl border border-border bg-surface shadow-lg"
      }
    >
      {!forceOpen ? (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between px-5 py-4 lg:cursor-default"
        >
          <div className="text-left">
            <h2 className="text-lg font-semibold text-text-primary">Find Resources</h2>
            <p className="mt-1 text-xs text-text-muted">
              Filter by location and services.
            </p>
          </div>
          <span className="text-sm text-text-muted lg:hidden">
            {open ? "Hide" : "Show"}
          </span>
        </button>
      ) : null}

      <div
        className={`
          ${forceOpen ? "space-y-4 px-1 pb-0" : "space-y-6 px-5 pb-5"}
          transition-all duration-300
          ${open || forceOpen ? "block" : "hidden"}
          lg:block
        `}
      >
        <FilterSection title="Location">
          <Field label="State">
            <input
              type="text"
              value={state}
              onChange={(event) => setState(event.target.value)}
              placeholder="Oklahoma"
              className="w-full rounded-lg border border-border bg-bg p-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </Field>
          <Field label="County">
            <input
              type="text"
              value={county}
              onChange={(event) => setCounty(event.target.value)}
              placeholder="Jefferson County"
              className="w-full rounded-lg border border-border bg-bg p-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </Field>
        </FilterSection>

        <FilterSection title="Tribal Eligibility">
          <Field label="Tribe">
            <div className="relative">
              <input
                type="text"
                value={tribe}
                onChange={(event) => {
                  setTribe(event.target.value);
                  setTribeDropdownOpen(true);
                  setActiveTribeIndex(0);
                }}
                onFocus={() => setTribeDropdownOpen(true)}
                onBlur={() => setTribeDropdownOpen(false)}
                onKeyDown={handleTribeKeyDown}
                placeholder="Search for a tribe"
                className="w-full rounded-lg border border-border bg-bg p-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                role="combobox"
                aria-expanded={tribeDropdownOpen}
                aria-autocomplete="list"
                aria-controls="tribe-filter-options"
              />

              {tribeDropdownOpen && filteredTribes.length > 0 ? (
                <div
                  id="tribe-filter-options"
                  role="listbox"
                  className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-lg"
                >
                  {filteredTribes.map((item, index) => (
                    <button
                      key={item}
                      type="button"
                      role="option"
                      aria-selected={index === activeTribeIndex}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        selectTribe(item);
                      }}
                      className={`block w-full px-3 py-2 text-left text-sm transition ${
                        index === activeTribeIndex
                          ? "bg-teal-50 text-teal-900"
                          : "text-text-primary hover:bg-bg"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </Field>
        </FilterSection>

        <FilterSection title="Services">
          <div className="space-y-2">
            {groupedSubcategories.map((group) => {
              const isExpanded = expandedSections.includes(group.value);

              return (
                <div key={group.value} className="border-b border-border/70 pb-2 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => toggleSection(group.value)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-semibold text-text-primary transition hover:bg-bg"
                    aria-expanded={isExpanded}
                  >
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true" className="text-xs text-text-muted">
                        {isExpanded ? "v" : ">"}
                      </span>
                      <span>{group.label}</span>
                    </span>
                  </button>

                  {isExpanded ? (
                    <div className="flex flex-wrap gap-2 px-2 pb-2 pt-1">
                      {group.subcategories.map((subcategory) => {
                        const isSelected = subcategories.includes(subcategory.value);

                        return (
                          <button
                            key={subcategory.value}
                            type="button"
                            onClick={() => toggleSubcategory(subcategory.value)}
                            className={`min-h-9 rounded-full border px-3 py-1.5 text-sm font-medium leading-5 transition ${
                              isSelected
                                ? "border-teal-700 bg-teal-700 text-white shadow-sm"
                                : "border-border bg-bg text-text-primary hover:border-teal-300 hover:bg-teal-50 hover:text-teal-900"
                            }`}
                            aria-pressed={isSelected}
                          >
                            {subcategory.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </FilterSection>

        <div
          className={
            forceOpen
              ? "sticky bottom-0 z-10 -mx-1 flex gap-3 border-t border-border bg-bg px-1 pb-3 pt-3"
              : "flex gap-3 pt-1"
          }
        >
          <button
            type="button"
            onClick={applyFilters}
            className="flex-1 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-800"
          >
            Apply Filters
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm text-text-primary transition hover:bg-surface"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function readMultiValue(value: string | null) {
  return value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function buildServiceGroups() {
  return PARENT_CATEGORIES.map((parentCategory) => ({
    ...parentCategory,
    subcategories: SUBCATEGORIES.filter(
      (subcategory) =>
        SUBCATEGORY_PARENT_MAP[subcategory.value] === parentCategory.value,
    ),
  })).filter((group) => group.subcategories.length > 0);
}

function setOrDelete(params: URLSearchParams, key: string, value: string) {
  const trimmed = value.trim();

  if (trimmed) {
    params.set(key, trimmed);
  } else {
    params.delete(key);
  }
}
