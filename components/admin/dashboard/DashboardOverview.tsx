"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getDashboardOverview,
  type DashboardOverviewData,
} from "@/lib/services/dashboard/dashboardService";
import { useAdminStore } from "@/lib/stores/adminStore";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import type { RecentImpactItem } from "@/lib/services/impact/impactTypes";

type DashboardCard = {
  id: string;
  title: string;
  countText: string;
  description: string;
  onView: () => void;
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

export default function DashboardOverview() {
  const [dashboard, setDashboard] = useState<DashboardOverviewData | null>(null);
  const [activityMode, setActivityMode] = useState<"my" | "team">("my");
  const [loading, setLoading] = useState(true);
  const { user } = useCurrentUser();

  const router = useRouter();
  const {
    setAdminSection,
    setResourcesSubtab,
    setMessagesSubtab,
    setQualitySubtab,
  } = useAdminStore();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);

      if (!user?.id) {
        if (!cancelled) {
          setDashboard(null);
          setLoading(false);
        }
        return;
      }

      try {
        const next = await getDashboardOverview(user.id);
        if (!cancelled) {
          setDashboard(next);
        }
      } catch (error) {
        console.error("Failed to load dashboard overview:", error);
        if (!cancelled) {
          setDashboard(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const activityFeed: RecentImpactItem[] = useMemo(() => {
    if (!dashboard) return [];
    return activityMode === "my" ? dashboard.recentActivity.my : dashboard.recentActivity.team;
  }, [dashboard, activityMode]);

  const cards = useMemo<DashboardCard[]>(() => {
    if (!dashboard) return [];

    return [
      {
        id: "pending-resources",
        title: "Pending Resources",
        countText: `${dashboard.pendingResources} awaiting review`,
        description: "Review and moderate incoming resource submissions.",
        onView: () => {
          setAdminSection("resources");
          setResourcesSubtab("pending");
          router.push("/admin?tab=resources&subtab=pending");
        },
      },
      {
        id: "update-requests",
        title: "Update Requests",
        countText: `${dashboard.updateRequests} pending requests`,
        description: "Approve or reject update requests to existing resources.",
        onView: () => {
          setAdminSection("update-requests");
          router.push("/admin?tab=update-requests");
        },
      },
      {
        id: "unread-notifications",
        title: "Unread Notifications",
        countText: `${dashboard.notifications} unread`,
        description: "See recent mentions, comments, and admin alerts.",
        onView: () => {
          setAdminSection("notifications");
          router.push("/admin?tab=notifications");
        },
      },
      {
        id: "community-messages",
        title: "Community Messages",
        countText: `${dashboard.communityMessages} new messages`,
        description: "Respond to community messages and feedback.",
        onView: () => {
          setAdminSection("messages");
          setMessagesSubtab("community");
          router.push("/admin?tab=messages&subtab=community");
        },
      },
      {
        id: "suggested-improvements",
        title: "Suggested Improvements",
        countText: `${dashboard.suggestedImprovements} open tasks`,
        description: "Fix missing data fields to improve directory quality.",
        onView: () => {
          setAdminSection("quality");
          setQualitySubtab("improvements");
          router.push("/admin?tab=quality&subtab=improvements");
        },
      },
      {
        id: "upcoming-events",
        title: "Upcoming Events",
        countText: `${dashboard.events} upcoming`,
        description: "Review current and upcoming community events.",
        onView: () => {
          setAdminSection("events");
          router.push("/admin?tab=events");
        },
      },
    ];
  }, [
    dashboard,
    router,
    setAdminSection,
    setResourcesSubtab,
    setMessagesSubtab,
    setQualitySubtab,
  ]);

  if (loading) {
    return <div className="text-sm text-text-muted">Loading dashboard...</div>;
  }

  const myImpact = dashboard?.myImpact ?? {
    impactPoints: 0,
    totalContributions: 0,
    thisWeek: 0,
  };

  const communityImpact = dashboard?.communityImpact ?? {
    totalImpactPoints: 0,
    totalImprovements: 0,
    activeAdmins: 0,
    directoryCompleteness: 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{getGreeting()} 👋</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="text-sm font-medium text-text-primary">👤 My Impact</div>
          <div className="mt-2 text-sm text-text-primary">Impact Points: {myImpact.impactPoints}</div>
          <div className="mt-1 text-sm text-text-primary">Total Contributions: {myImpact.totalContributions}</div>
          <div className="mt-1 text-sm text-text-primary">This Week: {myImpact.thisWeek}</div>

          <button
            type="button"
            onClick={() => setActivityMode("my")}
            className="mt-3 button button-secondary px-3 py-1.5 text-sm"
          >
            View My Activity →
          </button>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="text-sm font-medium text-text-primary">🤝 Community Impact</div>
          <div className="mt-2 text-sm text-text-primary">
            Total Impact Points: {communityImpact.totalImpactPoints}
          </div>
          <div className="mt-1 text-sm text-text-primary">
            Total Improvements: {communityImpact.totalImprovements}
          </div>
          <div className="mt-1 text-sm text-text-primary">Active Admins: {communityImpact.activeAdmins}</div>
          <div className="mt-1 text-sm text-text-primary">
            Directory Completeness: {communityImpact.directoryCompleteness}%
          </div>

          <button
            type="button"
            onClick={() => setActivityMode("team")}
            className="mt-3 button button-secondary px-3 py-1.5 text-sm"
          >
            View Team Activity →
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold">Recent Activity</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActivityMode("my")}
              className={`px-3 py-1 rounded-md text-sm border ${
                activityMode === "my"
                  ? "bg-bg text-text-primary border-border"
                  : "text-text-muted border-border"
              }`}
            >
              My Activity
            </button>
            <button
              type="button"
              onClick={() => setActivityMode("team")}
              className={`px-3 py-1 rounded-md text-sm border ${
                activityMode === "team"
                  ? "bg-bg text-text-primary border-border"
                  : "text-text-muted border-border"
              }`}
            >
              Team Activity
            </button>
          </div>
        </div>

        {activityFeed.length === 0 ? (
          <div className="text-sm text-text-muted mt-3">No recent activity yet.</div>
        ) : (
          <div className="mt-3 divide-y divide-border">
            {activityFeed.slice(0, 10).map((item) => (
              <div key={item.id} className="py-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-text-primary">{item.title}</div>
                  <div className="text-sm text-text-muted mt-0.5">{item.organization}</div>
                  <div className="text-xs text-text-subtle mt-0.5">{formatRelativeTime(item.createdAt)}</div>
                </div>
                <div className="text-sm font-medium text-green-700">+{item.points}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-base font-semibold mb-3">Operations Overview</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.id} className="bg-surface border border-border rounded-xl p-4">
              <div className="text-sm font-medium text-text-primary">{card.title}</div>
              <div className="mt-2 text-sm text-text-primary">{card.countText}</div>
              <div className="mt-1 text-sm text-text-muted">{card.description}</div>

              <button
                type="button"
                onClick={card.onView}
                className="mt-3 button button-secondary px-3 py-1.5 text-sm"
              >
                View →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
