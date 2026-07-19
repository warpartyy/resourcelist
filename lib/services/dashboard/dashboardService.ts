import { fetchDashboardSummary } from "@/lib/services/dashboardSummaryService";
import {
  getCommunityImpact,
  getDirectoryMetrics,
  getMyImpact,
  getMyRecentActivity,
  getRecentActivity,
} from "@/lib/services/impact/impactService";
import type {
  CommunityImpactSummary,
  DashboardImpactSummary,
  DirectoryMetrics,
  RecentActivitySummary,
} from "@/lib/services/impact/impactTypes";

export type DashboardOverviewData = {
  myImpact: DashboardImpactSummary;
  communityImpact: CommunityImpactSummary;
  directoryMetrics: DirectoryMetrics;
  recentActivity: RecentActivitySummary;
  pendingResources: number;
  updateRequests: number;
  suggestedImprovements: number;
  notifications: number;
  events: number;
  communityMessages: number;
};

export async function getDashboardOverview(adminId: string): Promise<DashboardOverviewData> {
  const [summary, myImpact, communityImpact, directoryMetrics, myRecent, teamRecent] = await Promise.all([
    fetchDashboardSummary(adminId),
    getMyImpact(adminId),
    getCommunityImpact(),
    getDirectoryMetrics(),
    getMyRecentActivity(adminId),
    getRecentActivity(10),
  ]);

  return {
    myImpact,
    communityImpact,
    directoryMetrics,
    recentActivity: {
      my: myRecent,
      team: teamRecent,
    },
    pendingResources: summary.pendingResources,
    updateRequests: summary.updateRequests,
    suggestedImprovements: summary.suggestedImprovements,
    notifications: summary.unreadNotifications,
    events: summary.upcomingEvents,
    communityMessages: summary.communityMessages,
  };
}
