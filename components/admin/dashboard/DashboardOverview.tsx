"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchDashboardSummary,
  type DashboardSummary,
} from "@/lib/services/dashboardSummaryService";
import { useAdminStore } from "@/lib/stores/adminStore";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import {
  getCommunityImpact,
  getMyImpact,
  getMyRecentActivity,
  getRecentActivity,
  type ActivityFeedItem,
  type CommunityImpactSummary,
  type ImpactSummary,
} from "@/lib/services/impact/impactService";

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

export default function DashboardOverview() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [myImpact, setMyImpact] = useState<ImpactSummary>({
    impactPoints: 0,
    totalContributions: 0,
    thisWeek: 0,
  });
  const [communityImpact, setCommunityImpact] = useState<CommunityImpactSummary>({
    totalImpactPoints: 0,
    totalImprovements: 0,
    activeAdmins: 0,
    directoryCompleteness: 0,
  });
  const [activityMode, setActivityMode] = useState<"my" | "team">("my");
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
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
      try {
        const next = await fetchDashboardSummary();
        if (!cancelled) {
          setSummary(next);
        }
      } catch (error) {
        console.error("Failed to load dashboard summary:", error);
        if (!cancelled) {
          setSummary({
            pendingResources: 0,
            updateRequests: 0,
            unreadNotifications: 0,
            communityMessages: 0,
            suggestedImprovements: 0,
            upcomingEvents: 0,
          });
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
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadImpact = async () => {
      if (!user?.id) {
        if (!cancelled) {
          setActivityFeed([]);
          setActivityLoading(false);
        }
        return;
      }

      setActivityLoading(true);

      try {
        const [my, community, myFeed, teamFeed] = await Promise.all([
          getMyImpact(user.id),
          getCommunityImpact(),
          getMyRecentActivity(user.id),
          getRecentActivity(10),
        ]);

        if (!cancelled) {
          setMyImpact(my);
          setCommunityImpact(community);
          setActivityFeed(activityMode === "my" ? myFeed : teamFeed);
        }
      } catch (error) {
        console.error("Failed to load impact dashboard:", error);
        if (!cancelled) {
          setActivityFeed([]);
        }
      } finally {
        if (!cancelled) {
          setActivityLoading(false);
        }
      }
    };

    loadImpact();

    return () => {
      cancelled = true;
    };
  }, [activityMode, user?.id]);

  const cards = useMemo<DashboardCard[]>(() => {
    if (!summary) return [];

    return [
      {
        id: "pending-resources",
        title: "Pending Resources",
        countText: `${summary.pendingResources} awaiting review`,
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
        countText: `${summary.updateRequests} pending requests`,
        description: "Approve or reject update requests to existing resources.",
        onView: () => {
          setAdminSection("update-requests");
          router.push("/admin?tab=update-requests");
        },
      },
      {
        id: "unread-notifications",
        title: "Unread Notifications",
        countText: `${summary.unreadNotifications} unread`,
        description: "See recent mentions, comments, and admin alerts.",
        onView: () => {
          setAdminSection("notifications");
          router.push("/admin?tab=notifications");
        },
      },
      {
        id: "community-messages",
        title: "Community Messages",
        countText: `${summary.communityMessages} new messages`,
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
        countText: `${summary.suggestedImprovements} open tasks`,
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
        countText: `${summary.upcomingEvents} upcoming`,
        description: "Review current and upcoming community events.",
        onView: () => {
          setAdminSection("events");
          router.push("/admin?tab=events");
        },
      },
    ];
  }, [
    summary,
    router,
    setAdminSection,
    setResourcesSubtab,
    setMessagesSubtab,
    setQualitySubtab,
  ]);

  if (loading) {
    return <div className="text-sm text-text-muted">Loading dashboard...</div>;
  }

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

        {activityLoading ? (
          <div className="text-sm text-text-muted mt-3">Loading activity...</div>
        ) : activityFeed.length === 0 ? (
          <div className="text-sm text-text-muted mt-3">No recent activity yet.</div>
        ) : (
          <div className="mt-3 divide-y divide-border">
            {activityFeed.slice(0, 10).map((item) => (
              <div key={item.id} className="py-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-text-primary">{item.title}</div>
                  <div className="text-sm text-text-muted mt-0.5">{item.organization}</div>
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
