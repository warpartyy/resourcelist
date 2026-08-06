"use client";

import { useMemo, useState } from "react";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingState from "./LoadingState";
import type { OpportunityReportItem } from "@/lib/hooks/resource-guide-intelligence/types";

type SortKey = keyof Pick<
  OpportunityReportItem,
  "searches" | "helpfulRate" | "averageRecommendations" | "clarificationRate"
>;

type OpportunitiesTableProps = {
  data: OpportunityReportItem[] | null;
  isLoading: boolean;
  error: string | null;
};

export default function OpportunitiesTable({
  data,
  isLoading,
  error,
}: OpportunitiesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("searches");
  const rows = useMemo(
    () => [...(data ?? [])].sort((a, b) => b[sortKey] - a[sortKey]),
    [data, sortKey]
  );

  if (isLoading) return <LoadingState label="Loading improvement opportunities" />;
  if (error) return <ErrorState message={error} />;
  if (!rows.length) return <EmptyState />;

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <h3 className="text-lg font-semibold">Improvement Opportunities</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-text-muted">
            <tr className="border-b border-border">
              <th className="py-2 font-medium">Need</th>
              <th className="py-2 font-medium">Concept</th>
              <th className="py-2 font-medium">City</th>
              <SortableHeader label="Searches" sortKey="searches" active={sortKey} onSort={setSortKey} />
              <SortableHeader label="Helpful Rate" sortKey="helpfulRate" active={sortKey} onSort={setSortKey} />
              <SortableHeader label="Avg Rec." sortKey="averageRecommendations" active={sortKey} onSort={setSortKey} />
              <SortableHeader label="Clarification" sortKey="clarificationRate" active={sortKey} onSort={setSortKey} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.need}-${row.concept}-${row.city}`}
                className="border-b border-border/60"
              >
                <td className="py-2">{row.need}</td>
                <td className="py-2">{row.concept}</td>
                <td className="py-2">{row.city}</td>
                <td className="py-2 text-right">{row.searches}</td>
                <td className="py-2 text-right">{formatPercent(row.helpfulRate)}</td>
                <td className="py-2 text-right">{row.averageRecommendations.toFixed(1)}</td>
                <td className="py-2 text-right">{formatPercent(row.clarificationRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SortableHeader({
  label,
  sortKey,
  active,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  active: SortKey;
  onSort: (key: SortKey) => void;
}) {
  return (
    <th className="py-2 text-right font-medium">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={active === sortKey ? "text-text-primary" : "text-text-muted"}
      >
        {label}
      </button>
    </th>
  );
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
