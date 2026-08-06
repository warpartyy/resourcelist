"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { getSupabase } from "@/lib/supabase";
import type { AdminSection } from "@/lib/stores/adminStore";
import { buildAdvisorState } from "@/lib/services/resources/ai/advisor/advisor";
import type {
  AdvisorRecommendation,
  AdvisorRecommendationCategory,
  AdvisorState,
} from "@/lib/services/resources/ai/advisor/types";
import ActionQueue from "./ActionQueue";
import EmptyState from "./EmptyState";
import HealthPanel from "./HealthPanel";
import LoadingState from "./LoadingState";
import OpportunityCard from "./OpportunityCard";
import RecommendationGroup from "./RecommendationGroup";

const CATEGORIES: AdvisorRecommendationCategory[] = [
  "directory",
  "search",
  "ai",
  "community_demand",
];

export default function AdvisorDashboard() {
  const router = useRouter();
  const [advisor, setAdvisor] = useState<AdvisorState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadAdvisor() {
      setIsLoading(true);
      setError(null);

      try {
        const nextAdvisor = await buildAdvisorState();

        if (mounted) {
          setAdvisor(nextAdvisor);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Unable to load advisor"
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAdvisor();

    return () => {
      mounted = false;
    };
  }, []);

  const groupedRecommendations = useMemo(() => {
    const groups = new Map<
      AdvisorRecommendationCategory,
      AdvisorRecommendation[]
    >(CATEGORIES.map((category) => [category, []]));

    for (const recommendation of advisor?.recommendations ?? []) {
      groups.get(recommendation.category)?.push(recommendation);
    }

    return groups;
  }, [advisor]);

  const handleSectionChange = (section: AdminSection) => {
    if (section === "resource-guide-advisor") {
      router.push("/admin/resource-guide/advisor");
      return;
    }

    if (section === "resource-guide-intelligence") {
      router.push("/admin/resource-guide/intelligence");
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
      adminSection="resource-guide-advisor"
      setAdminSection={handleSectionChange}
      onLogout={handleLogout}
    >
      <div className="space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-accent">
            AI Resource Guide Advisor
          </p>
          <div className="max-w-3xl space-y-2">
            <h2 className="text-2xl font-semibold text-text-primary md:text-3xl">
              What should improve next?
            </h2>
            <p className="text-sm leading-6 text-text-muted">
              Deterministic recommendations based on Resource Guide intelligence,
              feedback, search quality, and resource engagement.
            </p>
          </div>
        </header>

        {isLoading ? <LoadingState /> : null}
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && advisor ? (
          <>
            <HealthPanel items={advisor.health} />
            <ActionQueue recommendations={advisor.recommendations} />

            {advisor.recommendations.length === 0 ? (
              <EmptyState message="The advisor did not find any improvement recommendations in the current reporting data." />
            ) : (
              <div className="space-y-6">
                {CATEGORIES.map((category) => (
                  <RecommendationGroup
                    key={category}
                    category={category}
                    recommendations={groupedRecommendations.get(category) ?? []}
                  />
                ))}
              </div>
            )}

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Opportunity Summary</h2>
              {advisor.reports.opportunities.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {advisor.reports.opportunities.slice(0, 6).map((opportunity) => (
                    <OpportunityCard
                      key={`${opportunity.need}-${opportunity.concept}-${opportunity.city}`}
                      opportunity={opportunity}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
