import type {
  MonthlyImpactReportSummary,
  WeeklyDigestSummary,
} from "./types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getDirectoryCoverageReport } from "@/lib/services/admin/directory-coverage/coverage";
import { getResourceGuideIntelligenceOverview } from "@/lib/services/resources/ai/intelligence/reporting/overview";
import { getResourceGuideNeedsReport } from "@/lib/services/resources/ai/intelligence/reporting/needs";
import type { IntelligenceReportFilters } from "@/lib/services/resources/ai/intelligence/reporting/types";

const DEFAULT_INTELLIGENCE_FILTERS: IntelligenceReportFilters = {
  startDate: getDaysAgoIso(30),
  offset: 0,
  direction: "desc",
  limit: 10,
};

export async function buildWeeklyDigestSummary(): Promise<WeeklyDigestSummary> {
  const [pending, updateSuggestions, eventSubmissions, approved, rejected] =
    await Promise.all([
      countResourcesByStatus("pending"),
      countUpdateSuggestions(),
      countEventsByStatus("pending"),
      countResourcesByStatus("approved"),
      countResourcesByStatus("rejected"),
    ]);
  const [overview, needs, coverage] = await Promise.all([
    getResourceGuideIntelligenceOverview(DEFAULT_INTELLIGENCE_FILTERS),
    getResourceGuideNeedsReport(DEFAULT_INTELLIGENCE_FILTERS),
    getDirectoryCoverageReport({
      dateRange: "30d",
      startDate: getDaysAgoIso(30),
      direction: "desc",
    }),
  ]);

  const largestGap = coverage.opportunities[0]?.subcategory ?? null;

  return {
    newResourcesSubmitted: pending,
    updateSuggestions,
    eventSubmissions,
    resourcesApproved: approved,
    resourcesRejected: rejected,
    resourcesRestored: 0,
    resourceDiscoveryOpportunities: coverage.priorityQueue.length,
    totalSearches: overview.conversationCount,
    helpfulRate: overview.helpfulRate,
    largestGap,
    highestDemandCategory: coverage.summary.highestDemandCategory,
    topSearchedCategories: needs.slice(0, 5).map((item) => item.need),
  };
}

export async function buildMonthlyImpactReportSummary(): Promise<MonthlyImpactReportSummary> {
  const [overview, needs, coverage, added, approved, verified, tribal, updates] =
    await Promise.all([
      getResourceGuideIntelligenceOverview(DEFAULT_INTELLIGENCE_FILTERS),
      getResourceGuideNeedsReport(DEFAULT_INTELLIGENCE_FILTERS),
      getDirectoryCoverageReport({
        dateRange: "30d",
        startDate: getDaysAgoIso(30),
        direction: "desc",
      }),
      countResourcesAddedThisMonth(),
      countResourcesByStatus("approved"),
      countVerifiedResources(),
      countTribalResourcesAddedThisMonth(),
      countUpdateSuggestions(),
    ]);

  return {
    totalSearches: overview.conversationCount,
    helpfulRate: overview.helpfulRate,
    resourcesAdded: added,
    resourcesApproved: approved,
    tribalResourcesAdded: tribal,
    contributors: 0,
    resourcesVerified: verified,
    updateSuggestions: updates,
    topUnmetNeeds: needs.slice(0, 5).map((item) => item.need),
    largestImprovementSinceLastMonth:
      coverage.highlights[0]?.title ?? coverage.priorityQueue[0]?.service ?? null,
  };
}

async function countResourcesByStatus(status: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("resources")
    .select("id", { count: "exact", head: true })
    .eq("status", status);

  if (error) throw error;
  return count ?? 0;
}

async function countUpdateSuggestions(): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("resource_submissions")
    .select("id", { count: "exact", head: true })
    .eq("type", "update")
    .eq("status", "pending");

  if (error) throw error;
  return count ?? 0;
}

async function countEventsByStatus(status: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("status", status);

  if (error) throw error;
  return count ?? 0;
}

async function countResourcesAddedThisMonth(): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("resources")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved")
    .gte("submitted_at", getMonthStartIso());

  if (error) throw error;
  return count ?? 0;
}

async function countTribalResourcesAddedThisMonth(): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("resources")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved")
    .eq("is_tribal", true)
    .gte("submitted_at", getMonthStartIso());

  if (error) throw error;
  return count ?? 0;
}

async function countVerifiedResources(): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("resources")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved")
    .not("last_verified", "is", null);

  if (error) throw error;
  return count ?? 0;
}

function getMonthStartIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function getDaysAgoIso(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}
