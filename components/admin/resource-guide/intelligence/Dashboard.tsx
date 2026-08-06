"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { getSupabase } from "@/lib/supabase";
import type { AdminSection } from "@/lib/stores/adminStore";
import {
  DEFAULT_INTELLIGENCE_FILTERS,
  type IntelligenceDashboardFilters,
} from "@/lib/hooks/resource-guide-intelligence/types";
import { useConcepts } from "@/lib/hooks/resource-guide-intelligence/useConcepts";
import { useFeedback } from "@/lib/hooks/resource-guide-intelligence/useFeedback";
import { useGeography } from "@/lib/hooks/resource-guide-intelligence/useGeography";
import { useNeeds } from "@/lib/hooks/resource-guide-intelligence/useNeeds";
import { useOpportunities } from "@/lib/hooks/resource-guide-intelligence/useOpportunities";
import { useOverview } from "@/lib/hooks/resource-guide-intelligence/useOverview";
import { useQuality } from "@/lib/hooks/resource-guide-intelligence/useQuality";
import { useResources } from "@/lib/hooks/resource-guide-intelligence/useResources";
import { useTrends } from "@/lib/hooks/resource-guide-intelligence/useTrends";
import ConceptsChart from "./ConceptsChart";
import DashboardHeader from "./DashboardHeader";
import FeedbackPanel from "./FeedbackPanel";
import FiltersBar from "./FiltersBar";
import GeographyTable from "./GeographyTable";
import NeedsChart from "./NeedsChart";
import OpportunitiesTable from "./OpportunitiesTable";
import OverviewCards from "./OverviewCards";
import QualityPanel from "./QualityPanel";
import ResourcePerformanceTable from "./ResourcePerformanceTable";
import TrendChart from "./TrendChart";

export default function Dashboard() {
  const router = useRouter();
  const [filters, setFilters] = useState<IntelligenceDashboardFilters>(
    DEFAULT_INTELLIGENCE_FILTERS
  );
  const overview = useOverview(filters);
  const needs = useNeeds(filters);
  const concepts = useConcepts(filters);
  const geography = useGeography(filters);
  const resources = useResources(filters);
  const feedback = useFeedback(filters);
  const quality = useQuality(filters);
  const opportunities = useOpportunities(filters);
  const trends = useTrends(filters);

  const handleSectionChange = (section: AdminSection) => {
    if (section === "resource-guide-intelligence") {
      router.push("/admin/resource-guide/intelligence");
      return;
    }

    if (section === "search-lab") {
      router.push("/admin/search-lab");
      return;
    }

    if (section === "resource-guide-advisor") {
      router.push("/admin/resource-guide/advisor");
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
      adminSection="resource-guide-intelligence"
      setAdminSection={handleSectionChange}
      onLogout={handleLogout}
    >
      <div className="space-y-8">
        <DashboardHeader />
        <FiltersBar filters={filters} onChange={setFilters} />
        <OverviewCards {...overview} />
        <div className="grid gap-4 xl:grid-cols-2">
          <NeedsChart {...needs} />
          <ConceptsChart {...concepts} />
        </div>
        <GeographyTable {...geography} />
        <ResourcePerformanceTable {...resources} />
        <FeedbackPanel {...feedback} />
        <QualityPanel {...quality} />
        <OpportunitiesTable {...opportunities} />
        <TrendChart {...trends} />
      </div>
    </AdminLayout>
  );
}
