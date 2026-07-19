"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getDashboardOverview,
  type DashboardOverviewData,
} from "@/lib/services/dashboard/dashboardService";
import { useAdminStore } from "@/lib/stores/adminStore";
import type { RecentImpactItem } from "@/lib/services/impact/impactTypes";
import type { User } from "@supabase/supabase-js";

type DashboardCard = {
  id: string;
  icon: string;
  title: string;
  count: number;
  countText: string;
  description: string;
  emptyTitle?: string;
  emptyDescription?: string;
  actionLabel: string;
  onView: () => void;
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { label: "Good Morning", icon: "☀️" };
  if (hour < 17) return { label: "Good Afternoon", icon: "🌤️" };
  return { label: "Good Evening", icon: "🌙" };
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

function ProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const normalized = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-xs text-text-muted mb-1.5">
        <span>{label}</span>
        <span>{normalized}%</span>
      </div>
      <div
        className="h-2.5 rounded-full bg-bg border border-border overflow-hidden"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={normalized}
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300"
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
}

function DashboardActionCard({ card }: { card: DashboardCard }) {
  const isEmpty = card.count === 0;

  return (
    <section className="bg-surface border border-border rounded-xl p-5 shadow-sm h-full flex flex-col">
      <div className="text-xl leading-none" aria-hidden="true">
        {card.icon}
      </div>
      <h4 className="mt-3 text-sm font-semibold text-text-primary">{card.title}</h4>

      {isEmpty ? (
        <div className="mt-2">
          <p className="text-sm font-medium text-text-primary">{card.emptyTitle || "All clear."}</p>
          <p className="mt-1 text-sm text-text-muted">{card.emptyDescription || card.description}</p>
        </div>
      ) : (
        <>
          <p className="mt-2 text-lg font-semibold text-text-primary">{card.countText}</p>
          <p className="mt-1 text-sm text-text-muted">{card.description}</p>
        </>
      )}

      <button
        type="button"
        onClick={card.onView}
        className="mt-4 button button-secondary px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        aria-label={`${card.actionLabel} for ${card.title}`}
      >
        {card.actionLabel}
      </button>
    </section>
  );
}

type Props = {
  user: User | null;
  refreshVersion?: number;
};

export default function DashboardOverview({ user, refreshVersion = 0 }: Props) {
  const [dashboard, setDashboard] = useState<DashboardOverviewData | null>(null);
  const [activityMode, setActivityMode] = useState<"my" | "team">("my");
  const [loading, setLoading] = useState(true);

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
  }, [user?.id, refreshVersion]);

  const activityFeed: RecentImpactItem[] = useMemo(() => {
    if (!dashboard) return [];
    return activityMode === "my" ? dashboard.recentActivity.my : dashboard.recentActivity.team;
  }, [dashboard, activityMode]);

  const operationsCards = useMemo<DashboardCard[]>(() => {
    if (!dashboard) return [];

    return [
      {
        id: "pending-resources",
        icon: "📥",
        title: "Pending Resources",
        count: dashboard.pendingResources,
        countText: `${dashboard.pendingResources} awaiting review`,
        description: "Review and moderate incoming resource submissions.",
        emptyTitle: "No pending submissions.",
        emptyDescription: "You are all caught up.",
        actionLabel: "Review submissions →",
        onView: () => {
          setAdminSection("resources");
          setResourcesSubtab("pending");
          router.push("/admin?tab=resources&subtab=pending");
        },
      },
      {
        id: "update-requests",
        icon: "🛠️",
        title: "Update Requests",
        count: dashboard.updateRequests,
        countText: `${dashboard.updateRequests} pending requests`,
        description: "Approve or reject update requests to existing resources.",
        emptyTitle: "No pending requests.",
        emptyDescription: "Recent updates are fully reviewed.",
        actionLabel: "Open requests →",
        onView: () => {
          setAdminSection("update-requests");
          router.push("/admin?tab=update-requests");
        },
      },
      {
        id: "unread-notifications",
        icon: "🔔",
        title: "Notifications",
        count: dashboard.notifications,
        countText: `${dashboard.notifications} unread`,
        description: "See recent mentions, comments, and admin alerts.",
        emptyTitle: "No unread notifications.",
        emptyDescription: "You are up to date on recent alerts.",
        actionLabel: "View notifications →",
        onView: () => {
          setAdminSection("notifications");
          router.push("/admin?tab=notifications");
        },
      },
      {
        id: "community-messages",
        icon: "💬",
        title: "Community Messages",
        count: dashboard.communityMessages,
        countText: `${dashboard.communityMessages} new messages`,
        description: "Respond to community messages and feedback.",
        emptyTitle: "No new community messages.",
        emptyDescription: "Inbox is clear for now.",
        actionLabel: "Open messages →",
        onView: () => {
          setAdminSection("messages");
          setMessagesSubtab("community");
          router.push("/admin?tab=messages&subtab=community");
        },
      },
      {
        id: "upcoming-events",
        icon: "📅",
        title: "Upcoming Events",
        count: dashboard.events,
        countText: `${dashboard.events} upcoming`,
        description: "Review current and upcoming community events.",
        emptyTitle: "No upcoming events.",
        emptyDescription: "Nothing scheduled right now.",
        actionLabel: "View events →",
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

  const greeting = getGreeting();
  const hasSuggestedImprovements = (dashboard?.suggestedImprovements || 0) > 0;

  const openSuggestions = dashboard?.suggestedImprovements || 0;

  return (
    <div className="space-y-10">
      <section className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          {greeting.label} {greeting.icon}
        </h2>
        <p className="text-text-muted">Welcome back. Here is what is happening today.</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-base font-semibold">Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="bg-surface border border-border rounded-xl p-5 shadow-sm ring-1 ring-accent/20">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-text-primary">👤 My Impact</div>
                <p className="mt-1 text-xs text-text-muted">Your direct contributions to directory quality.</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full border border-border bg-bg text-text-muted">
                Personal
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-text-muted">Impact Points</p>
                <p className="mt-1 text-xl font-semibold text-text-primary">{myImpact.impactPoints}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Contributions</p>
                <p className="mt-1 text-xl font-semibold text-text-primary">{myImpact.totalContributions}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">This Week</p>
                <p className="mt-1 text-xl font-semibold text-green-700">+{myImpact.thisWeek}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActivityMode("my")}
              className="mt-5 button button-secondary px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              aria-label="View my recent activity"
            >
              View Activity →
            </button>
          </section>

          <section className="bg-surface border border-border rounded-xl p-5 shadow-sm ring-1 ring-accent/20">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-text-primary">🤝 Community Impact</div>
                <p className="mt-1 text-xs text-text-muted">How the admin team is improving directory health.</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full border border-border bg-bg text-text-muted">
                Team
              </span>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-text-muted">Directory Health</p>
                <p className="mt-1 text-2xl font-semibold text-text-primary">
                  {communityImpact.directoryCompleteness}%
                </p>
                <div className="mt-2">
                  <ProgressBar
                    value={communityImpact.directoryCompleteness}
                    label="Directory completeness"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-text-muted">Improvements</p>
                  <p className="mt-1 text-lg font-semibold text-text-primary">{communityImpact.totalImprovements}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Active Admins</p>
                  <p className="mt-1 text-lg font-semibold text-text-primary">{communityImpact.activeAdmins}</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActivityMode("team")}
              className="mt-5 button button-secondary px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              aria-label="View team recent activity"
            >
              View Team Activity →
            </button>
          </section>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold">Operations Overview</h3>
          <p className="text-xs text-text-muted">Actionable queues and team inboxes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {operationsCards.map((card) => (
            <DashboardActionCard key={card.id} card={card} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-base font-semibold">Quality</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="bg-surface border border-border rounded-xl p-5 shadow-sm h-full">
            <div className="text-xl leading-none" aria-hidden="true">
              ✨
            </div>
            <h4 className="mt-3 text-sm font-semibold text-text-primary">Suggested Improvements</h4>

            {hasSuggestedImprovements ? (
              <>
                <p className="mt-2 text-lg font-semibold text-text-primary">
                  {openSuggestions} open tasks
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  Prioritize urgent issues first, then work through medium and low-impact cleanup.
                </p>

                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-lg border border-border bg-bg p-3">
                    <p className="text-xs text-text-muted">High</p>
                    <p className="mt-1 font-semibold text-text-primary">In queue</p>
                  </div>
                  <div className="rounded-lg border border-border bg-bg p-3">
                    <p className="text-xs text-text-muted">Medium</p>
                    <p className="mt-1 font-semibold text-text-primary">In queue</p>
                  </div>
                  <div className="rounded-lg border border-border bg-bg p-3">
                    <p className="text-xs text-text-muted">Low</p>
                    <p className="mt-1 font-semibold text-text-primary">In queue</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-2">
                <p className="text-sm font-medium text-text-primary">No suggested improvements.</p>
                <p className="mt-1 text-sm text-text-muted">The directory is looking great.</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setAdminSection("quality");
                setQualitySubtab("improvements");
                router.push("/admin?tab=quality&subtab=improvements");
              }}
              className="mt-4 button button-secondary px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              aria-label="Open suggested improvements queue"
            >
              Open Queue →
            </button>
          </section>

          <section className="bg-surface border border-border rounded-xl p-5 shadow-sm h-full">
            <div className="text-xl leading-none" aria-hidden="true">
              🧭
            </div>
            <h4 className="mt-3 text-sm font-semibold text-text-primary">Directory Health Snapshot</h4>
            <p className="mt-2 text-sm text-text-muted">
              Verified resources and data completeness from the current approved directory.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-border bg-bg p-3">
                <p className="text-xs text-text-muted">Approved</p>
                <p className="mt-1 font-semibold text-text-primary">{dashboard?.directoryMetrics.approvedResources || 0}</p>
              </div>
              <div className="rounded-lg border border-border bg-bg p-3">
                <p className="text-xs text-text-muted">Verified</p>
                <p className="mt-1 font-semibold text-text-primary">{dashboard?.directoryMetrics.verifiedResources || 0}</p>
              </div>
              <div className="rounded-lg border border-border bg-bg p-3">
                <p className="text-xs text-text-muted">Missing Phone</p>
                <p className="mt-1 font-semibold text-text-primary">{dashboard?.directoryMetrics.resourcesMissingPhone || 0}</p>
              </div>
              <div className="rounded-lg border border-border bg-bg p-3">
                <p className="text-xs text-text-muted">Missing Website</p>
                <p className="mt-1 font-semibold text-text-primary">{dashboard?.directoryMetrics.resourcesMissingWebsite || 0}</p>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="bg-surface border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold">Recent Activity</h3>
          <div className="flex items-center gap-2" role="tablist" aria-label="Recent activity filters">
            <button
              type="button"
              onClick={() => setActivityMode("my")}
              className={`px-3 py-1 rounded-md text-sm border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                activityMode === "my"
                  ? "bg-bg text-text-primary border-border"
                  : "text-text-muted border-border"
              }`}
              aria-pressed={activityMode === "my"}
            >
              My Activity
            </button>
            <button
              type="button"
              onClick={() => setActivityMode("team")}
              className={`px-3 py-1 rounded-md text-sm border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                activityMode === "team"
                  ? "bg-bg text-text-primary border-border"
                  : "text-text-muted border-border"
              }`}
              aria-pressed={activityMode === "team"}
            >
              Team Activity
            </button>
          </div>
        </div>

        {activityFeed.length === 0 ? (
          <div className="mt-4 rounded-lg border border-border bg-bg px-4 py-5">
            <p className="text-sm font-medium text-text-primary">No recent activity yet.</p>
            <p className="mt-1 text-sm text-text-muted">New impact events will appear here.</p>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-border">
            {activityFeed.slice(0, 10).map((item) => (
              <article key={item.id} className="py-3.5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">✔ {item.title}</p>
                  <p className="text-sm text-text-muted mt-0.5 truncate">{item.organization}</p>
                  <p className="text-xs text-text-subtle mt-0.5">{formatRelativeTime(item.createdAt)}</p>
                </div>
                <p className="text-sm font-semibold text-green-700 shrink-0">+{item.points}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
