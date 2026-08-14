"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { getSupabase } from "@/lib/supabase";
import type { AdminSection } from "@/lib/stores/adminStore";
import type { DirectoryCoverageReport } from "@/lib/services/admin/directory-coverage/types";
import { buildResourceDiscoveryQueue } from "@/lib/services/admin/resource-discovery/discovery";
import type {
  ResourceDiscoveryCandidate,
  ResourceDiscoveryFilters as ResourceDiscoveryFilterState,
  ResourceDiscoveryQueueItem,
  ResourceDiscoveryResearchRequest,
  ResourceDiscoverySessionSummary,
} from "@/lib/services/admin/resource-discovery/types";
import CandidateOrganizationsPanel from "./CandidateOrganizationsPanel";
import DiscoveryQueue from "./DiscoveryQueue";
import DiscoveryWorkspace from "./DiscoveryWorkspace";
import RecentResearchPanel from "./RecentResearchPanel";
import ResourceDiscoveryFilters from "./ResourceDiscoveryFilters";

const DEFAULT_FILTERS: ResourceDiscoveryFilterState = {
  dateRange: "30d",
  state: "",
  county: "",
  city: "",
  parentCategory: "",
  subcategory: "",
};

const DEFAULT_RESEARCH: ResourceDiscoveryResearchRequest = {
  parentCategory: "",
  subcategory: "",
  state: "Oklahoma",
  county: "",
  city: "",
  scope: "Statewide",
  keywords: "",
  maximumResults: 5,
};

export default function ResourceDiscoveryDashboard() {
  const router = useRouter();
  const [filters, setFilters] =
    useState<ResourceDiscoveryFilterState>(DEFAULT_FILTERS);
  const [coverageReport, setCoverageReport] =
    useState<DirectoryCoverageReport | null>(null);
  const [research, setResearch] =
    useState<ResourceDiscoveryResearchRequest>(DEFAULT_RESEARCH);
  const [candidates, setCandidates] = useState<ResourceDiscoveryCandidate[]>([]);
  const [recentSessions, setRecentSessions] = useState<ResourceDiscoverySessionSummary[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidateError, setCandidateError] = useState<string | null>(null);
  const [hasRunResearch, setHasRunResearch] = useState(false);
  const [creatingCandidateKey, setCreatingCandidateKey] = useState<string | null>(null);
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
    const controller = new AbortController();

    async function loadRecentSessions() {
      setIsLoadingSessions(true);

      try {
        const token = await getCurrentAccessToken();
        const response = await fetch("/api/admin/resource-discovery/sessions", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Recent research request failed: ${response.status}`);
        }

        const data = (await response.json()) as {
          sessions: ResourceDiscoverySessionSummary[];
        };

        setRecentSessions(data.sessions);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Unable to load recent resource discovery sessions", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSessions(false);
        }
      }
    }

    void loadRecentSessions();

    return () => controller.abort();
  }, []);

  const handleResearch = () => {
    const controller = new AbortController();

    async function loadCandidates() {
      if (!research.parentCategory || !research.state.trim()) {
        setCandidates([]);
        return;
      }

      setIsLoadingCandidates(true);
      setCandidateError(null);
      setHasRunResearch(true);

      try {
        const token = await getCurrentAccessToken();
        const response = await fetch("/api/admin/resource-discovery/candidates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(research),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Candidate discovery failed: ${response.status}`);
        }

        const data = (await response.json()) as {
          session: ResourceDiscoverySessionSummary;
          candidates: ResourceDiscoveryCandidate[];
        };

        setSelectedSessionId(data.session.id);
        setRecentSessions((current) => [
          data.session,
          ...current.filter((session) => session.id !== data.session.id),
        ]);
        setCandidates(data.candidates);
      } catch (err) {
        if (!controller.signal.aborted) {
          setCandidates([]);
          setCandidateError(
            err instanceof Error ? err.message : "Unable to discover candidates",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingCandidates(false);
        }
      }
    }

    void loadCandidates();
  };

  const handleSelectSession = async (session: ResourceDiscoverySessionSummary) => {
    setIsLoadingCandidates(true);
    setCandidateError(null);

    try {
      const token = await getCurrentAccessToken();
      const response = await fetch(
        `/api/admin/resource-discovery/sessions/${session.id}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );

      if (!response.ok) {
        throw new Error(`Saved research request failed: ${response.status}`);
      }

      const data = (await response.json()) as {
        session: ResourceDiscoverySessionSummary;
        candidates: ResourceDiscoveryCandidate[];
      };

      setSelectedSessionId(data.session.id);
      setResearch({
        parentCategory: data.session.parentCategory,
        subcategory: data.session.subcategory ?? "",
        state: data.session.state,
        county: data.session.county ?? "",
        city: data.session.city ?? "",
        scope: data.session.searchScope,
        keywords: data.session.keywords ?? "",
        maximumResults: data.session.maxResults,
      });
      setCandidates(data.candidates);
      setHasRunResearch(true);
    } catch (err) {
      setCandidates([]);
      setCandidateError(
        err instanceof Error ? err.message : "Unable to load saved research",
      );
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  const handleUseInsight = (item: ResourceDiscoveryQueueItem) => {
    setResearch((current) => ({
      ...current,
      parentCategory: item.parentCategory ?? current.parentCategory,
      subcategory: item.subcategoryValue ?? item.subcategory,
      county: item.county ?? current.county,
      city: "",
    }));
    setCandidates([]);
    setCandidateError(null);
    setHasRunResearch(false);
    setSelectedSessionId(null);
  };

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

  const handleCreatePendingResource = async (candidate: ResourceDiscoveryCandidate) => {
    const candidateKey = getCandidateKey(candidate);

    setCreatingCandidateKey(candidateKey);
    setCandidateError(null);

    try {
      const token = await getCurrentAccessToken();
      const response = await fetch("/api/admin/resource-discovery/pending-resource", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          candidateId: candidate.id,
          organization: candidate.organization,
          website: candidate.website,
        }),
      });

      if (!response.ok) {
        throw new Error(`Pending resource creation failed: ${response.status}`);
      }

      setCandidates((current) =>
        current.map((item) =>
          getCandidateKey(item) === candidateKey
            ? { ...item, reviewStatus: "Created" }
            : item,
        ),
      );
    } catch (err) {
      setCandidateError(
        err instanceof Error
          ? err.message
          : "Unable to create pending resource",
      );
    } finally {
      setCreatingCandidateKey(null);
    }
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
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <DiscoveryQueue items={queue} onUseSearch={handleUseInsight} />
              <RecentResearchPanel
                sessions={recentSessions}
                selectedSessionId={selectedSessionId}
                isLoading={isLoadingSessions}
                onSelect={handleSelectSession}
              />
            </div>
            <DiscoveryWorkspace
              research={research}
              isResearching={isLoadingCandidates}
              onChange={setResearch}
              onSubmit={handleResearch}
            />
            <CandidateOrganizationsPanel
              candidates={candidates}
              error={candidateError}
              hasRunResearch={hasRunResearch}
              isLoading={isLoadingCandidates}
              creatingCandidateKey={creatingCandidateKey}
              onCreatePendingResource={handleCreatePendingResource}
            />
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}

function getCandidateKey(candidate: ResourceDiscoveryCandidate) {
  return candidate.id ?? `${candidate.organization}-${candidate.website ?? "none"}`;
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
