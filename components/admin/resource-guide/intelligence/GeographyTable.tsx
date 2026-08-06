"use client";

import { useMemo, useState } from "react";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingState from "./LoadingState";
import type { GeographyReport } from "@/lib/hooks/resource-guide-intelligence/types";

type GeographyKey = "cities" | "counties" | "states";

type GeographyTableProps = {
  data: GeographyReport | null;
  isLoading: boolean;
  error: string | null;
};

export default function GeographyTable({
  data,
  isLoading,
  error,
}: GeographyTableProps) {
  const [tab, setTab] = useState<GeographyKey>("cities");
  const rows = useMemo(
    () => [...(data?.[tab] ?? [])].sort((a, b) => b.count - a.count),
    [data, tab]
  );

  if (isLoading) return <LoadingState label="Loading geographic demand" />;
  if (error) return <ErrorState message={error} />;
  if (!data) return <EmptyState />;

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">Geographic Demand</h3>
        <div className="flex rounded-lg border border-border bg-bg p-1">
          {(["cities", "counties", "states"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-md px-3 py-1.5 text-sm ${
                tab === key ? "bg-surface text-text-primary shadow-sm" : "text-text-muted"
              }`}
            >
              {key[0].toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="mt-4">
          <EmptyState />
        </div>
      ) : (
        <table className="mt-4 w-full text-left text-sm">
          <thead className="text-text-muted">
            <tr className="border-b border-border">
              <th className="py-2 font-medium">Name</th>
              <th className="py-2 text-right font-medium">Search Count</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-b border-border/60">
                <td className="py-2 text-text-primary">{row.name}</td>
                <td className="py-2 text-right text-text-muted">{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
