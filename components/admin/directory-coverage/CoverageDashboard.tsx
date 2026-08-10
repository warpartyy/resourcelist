"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { getSupabase } from "@/lib/supabase";
import type { AdminSection } from "@/lib/stores/adminStore";
import type {
  CoverageDateRange,
  DirectoryCoverageReport,
} from "@/lib/services/admin/directory-coverage/types";
import CoverageChart from "./CoverageChart";
import CoverageFilters from "./CoverageFilters";
import CoverageGapTable from "./CoverageGapTable";
import CoverageSummary from "./CoverageSummary";
import DirectoryHealthPanel from "./DirectoryHealthPanel";
import OpportunityHighlights from "./OpportunityHighlights";
import ParentCategoryRollups from "./ParentCategoryRollups";
import PriorityQueue from "./PriorityQueue";

export type CoverageDashboardFilters = {
  dateRange: CoverageDateRange;
  state: string;
  county: string;
  city: string;
  parentCategory: string;
  sort: string;
  direction: "asc" | "desc";
};

const DEFAULT_FILTERS: CoverageDashboardFilters = {
  dateRange: "30d",
  state: "",
  county: "",
  city: "",
  parentCategory: "",
  sort: "gapScore",
  direction: "desc",
};

export default function CoverageDashboard() {
  const router = useRouter();
  const [filters, setFilters] =
    useState<CoverageDashboardFilters>(DEFAULT_FILTERS);
  const [report, setReport] = useState<DirectoryCoverageReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryString = useMemo(() => buildQueryString(filters), [filters]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCoverage() {
      setIsLoading(true);
      setError(null);

      try {
        const token = await getCurrentAccessToken();
        const response = await fetch(
          `/api/admin/directory-coverage${queryString}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`Coverage request failed: ${response.status}`);
        }

        setReport((await response.json()) as DirectoryCoverageReport);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Unable to load coverage");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadCoverage();

    return () => controller.abort();
  }, [queryString]);

  const handleSectionChange = (section: AdminSection) => {
    if (section === "resource-guide-intelligence") {
      router.push("/admin/resource-guide/intelligence");
      return;
    }

    if (section === "resource-guide-advisor") {
      router.push("/admin/resource-guide/advisor");
      return;
    }

    if (section === "search-lab") {
      router.push("/admin/search-lab");
      return;
    }

    if (section === "directory-coverage") {
      router.push("/admin/directory-coverage");
      return;
    }

    router.push(`/admin?tab=${section}`);
  };

  const handleLogout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <AdminLayout
      adminSection="directory-coverage"
      setAdminSection={handleSectionChange}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        <header>
          <p className="text-sm font-medium uppercase tracking-wide text-teal-700">
            Directory Coverage
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-text-primary">
            Coverage & Demand
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-text-muted">
            Compare approved directory supply with Resource Guide demand to decide
            which service areas would benefit most from provider recruitment.
          </p>
        </header>

        <CoverageFilters filters={filters} onChange={setFilters} />

        {error ? (
          <StatePanel title="Unable to load coverage" message={error} />
        ) : null}

        {isLoading ? (
          <StatePanel title="Loading coverage" message="Aggregating approved resources and demand signals..." />
        ) : null}

        {!isLoading && !error && report ? (
          <>
            <div className="flex flex-wrap gap-2">
              <ExportButton
                label="Export CSV"
                onClick={() => exportCsv(report)}
              />
              <ExportButton
                label="Export JSON"
                onClick={() => exportJson(report)}
              />
            </div>
            <DirectoryHealthPanel health={report.health} />
            <OpportunityHighlights highlights={report.highlights} />
            <CoverageSummary summary={report.summary} />
            <ParentCategoryRollups
              rollups={report.parentRollups}
              onSelect={(parentCategory) =>
                setFilters((current) => ({ ...current, parentCategory }))
              }
            />
            <CoverageChart coverage={report.coverage} />
            <PriorityQueue items={report.priorityQueue} />
            <CoverageGapTable opportunities={report.opportunities} />
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}

function ExportButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary shadow-sm hover:border-teal-300 hover:bg-teal-50"
    >
      {label}
    </button>
  );
}

function StatePanel({ title, message }: { title: string; message: string }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm text-text-muted">{message}</p>
    </section>
  );
}

async function getCurrentAccessToken() {
  const supabase = getSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

function buildQueryString(filters: CoverageDashboardFilters) {
  const params = new URLSearchParams();

  params.set("dateRange", filters.dateRange);
  setIfPresent(params, "state", filters.state);
  setIfPresent(params, "county", filters.county);
  setIfPresent(params, "city", filters.city);
  setIfPresent(params, "parentCategory", filters.parentCategory);
  setIfPresent(params, "sort", filters.sort);
  params.set("direction", filters.direction);

  const query = params.toString();
  return query ? `?${query}` : "";
}

function setIfPresent(params: URLSearchParams, key: string, value: string) {
  if (value.trim()) {
    params.set(key, value.trim());
  }
}

function exportCsv(report: DirectoryCoverageReport) {
  const headers = [
    "subcategory",
    "county",
    "resource count",
    "search count",
    "helpful rate",
    "recommendation rate",
    "gap score",
  ];
  const rows = report.exportRows.map((row) => [
    row.subcategory,
    row.county,
    String(row.resourceCount),
    String(row.searchCount),
    String(row.helpfulRate),
    String(row.recommendationRate),
    String(row.gapScore),
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");

  downloadFile("directory-coverage.csv", "text/csv", csv);
}

function exportJson(report: DirectoryCoverageReport) {
  downloadFile(
    "directory-coverage.json",
    "application/json",
    JSON.stringify(report.exportRows, null, 2)
  );
}

function escapeCsvValue(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function downloadFile(filename: string, type: string, content: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
