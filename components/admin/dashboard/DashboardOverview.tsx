"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchDashboardSummary,
  type DashboardSummary,
} from "@/lib/services/dashboardSummaryService";
import { useAdminStore } from "@/lib/stores/adminStore";

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
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold">{getGreeting()} 👋</h2>
      </div>

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
  );
}
