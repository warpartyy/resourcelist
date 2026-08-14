"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SearchFilters from "@/app/search/SearchFilters";

export default function MobileSearchFilters() {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const activeFilterCount = countActiveFilters(searchParams);
  const searchParamKey = searchParams.toString();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="mb-5 lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-teal-700 bg-teal-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2"
      >
        Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
      </button>

      {open ? (
        <div
          className="fixed inset-x-0 bottom-0 top-16 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-4 py-4"
          role="dialog"
          aria-modal="true"
          aria-label="Search filters"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
          />

          <div className="relative flex max-h-[calc(100dvh-4rem-2rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl">
            <div className="absolute right-3 top-3 z-20">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-bg text-xl leading-none text-text-primary shadow-sm transition hover:bg-surface focus:outline-none focus:ring-2 focus:ring-teal-300"
                aria-label="Close filters"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-0 pt-4">
              <SearchFilters
                key={searchParamKey}
                forceOpen
                onApply={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function countActiveFilters(searchParams: URLSearchParams) {
  return (
    readMultiValue(searchParams.get("sub")).length +
    readMultiValue(searchParams.get("tags")).length +
    (searchParams.get("state") ? 1 : 0) +
    (searchParams.get("county") ? 1 : 0) +
    (searchParams.get("tribe") ? 1 : 0) +
    (searchParams.get("parent") ? 1 : 0)
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
