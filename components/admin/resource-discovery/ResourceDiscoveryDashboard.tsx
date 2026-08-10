"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { getSupabase } from "@/lib/supabase";
import type { AdminSection } from "@/lib/stores/adminStore";
import type { DirectoryCoverageReport } from "@/lib/services/admin/directory-coverage/types";
import {
  buildResourceDiscoveryQueue,
  discoverCandidateOrganizations,
} from "@/lib/services/admin/resource-discovery/discovery";
import type {
  ResourceDiscoveryCandidate,
  ResourceDiscoveryFilters as ResourceDiscoveryFilterState,
  ResourceDiscoveryQueueItem,
} from "@/lib/services/admin/resource-discovery/types";
import CandidateOrganizationsPanel from "./CandidateOrganizationsPanel";
import DiscoveryQueue from "./DiscoveryQueue";
import DiscoveryWorkspace from "./DiscoveryWorkspace";
import ResourceDiscoveryFilters from "./ResourceDiscoveryFilters";

const DEFAULT_FILTERS: ResourceDiscoveryFilterState = {
  dateRange: "30d",
  state: "",
  county: "",
  city: "",
  parentCategory: "",
  subcategory: "",
};

export default function ResourceDiscoveryDashboard() {
  const router = useRouter();
  const [filters, setFilters] =
    useState<ResourceDiscoveryFilterState>(DEFAULT_FILTERS);
  const [coverageReport, setCoverageReport] =
    useState<DirectoryCoverageReport | null>(null);
  const [selectedItem, setSelectedItem] =
    useState<ResourceDiscoveryQueueItem | null>(null);
  const [candidates, setCandidates] = useState<ResourceDiscoveryCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryString = useMemo(() => buildCoverageQueryString(filters), [filters]);
  const queue = useMemo(
    () =>
      coverageReport
        ? buildResourceDiscoveryQueue(coverageReport, filters)
        : [],
    [coverageReport, filters]
  );

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
          throw new Error(`Discovery coverage request failed: ${response.status}`);
        }

        setCoverageReport((await response.json()) as DirectoryCoverageReport);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Unable to load discovery queue");
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

  useEffect(() => {
    setSelectedItem((current) => {
      if (!current) {
        return queue[0] ?? null;
      }

      return queue.find((item) => item.id === current.id) ?? queue[0] ?? null;
    });
  }, [queue]);

  useEffect(() => {
    async function loadCandidates() {
      if (!selectedItem) {
        setCandidates([]);
        return;
      }

      setCandidates(
        await discoverCandidateOrganizations({
          queueItem: selectedItem,
          filters,
        })
      );
    }

    void loadCandidates();
  }, [filters, selectedItem]);

  const handleSectionChange = (section: AdminSection) => {
    if (section === "resource-discovery") {
      router.push("/admin/resource-discovery");
      return;
    }

    if (section === "directory-coverage") {
      router.push("/admin/directory-coverage");
      return;
    }

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

    router.push(`/admin?tab=${section}`);
  };

  const handleLogout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <AdminLayout
      adminSection="resource-discovery"
      setAdminSection={handleSectionChange}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        <header>
          <p className="text-sm font-medium uppercase tracking-wide text-teal-700">
            Resource Guide Insights
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-text-primary">
            Resource Discovery
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-text-muted">
            Discover organizations that may help fill gaps in the Resource Guide.
          </p>
        </header>

        <ResourceDiscoveryFilters filters={filters} onChange={setFilters} />

        {error ? <StatePanel title="Unable to load Resource Discovery" message={error} /> : null}
        {isLoading ? (
          <StatePanel
            title="Loading discovery queue"
            message="Reading Directory Coverage gap scores..."
          />
        ) : null}

        {!isLoading && !error ? (
          <>
            <DiscoveryQueue
              items={queue}
              selectedItemId={selectedItem?.id}
              onSelect={setSelectedItem}
            />
            <DiscoveryWorkspace selectedItem={selectedItem} />
            <CandidateOrganizationsPanel candidates={candidates} />
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}

function StatePanel({ title, message }: { title: string; message: string }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
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

function buildCoverageQueryString(filters: ResourceDiscoveryFilterState) {
  const params = new URLSearchParams();

  params.set("dateRange", filters.dateRange);
  params.set("sort", "gapScore");
  params.set("direction", "desc");
  setIfPresent(params, "state", filters.state);
  setIfPresent(params, "county", filters.county);
  setIfPresent(params, "city", filters.city);
  setIfPresent(params, "parentCategory", filters.parentCategory);

  return `?${params.toString()}`;
}

function setIfPresent(params: URLSearchParams, key: string, value: string) {
  if (value.trim()) {
    params.set(key, value.trim());
  }
}
