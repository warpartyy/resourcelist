"use client";

import PendingTab from "./PendingTab";
import RejectedTab from "./RejectedTab";
import ResourcesTab from "./ResourcesTab";
import AdminSettingsPage from "@/app/admin/settings/page";
import EventsTab from "./EventsTab";
import MessagesTab from "@/app/admin/components/MessagesTab";
import UpdateRequestsTab from "./UpdateRequestsTab";
import NotificationsPanel from "@/components/admin/NotificationsPanel";
import SuggestedImprovementsPanel from "@/components/admin/improvements/SuggestedImprovementsPanel";
import { useAdminStore } from "@/lib/stores/adminStore";
import DashboardOverview from "@/components/admin/dashboard/DashboardOverview";
import type { User } from "@supabase/supabase-js";

type Props = {
  editedSubmission: Record<string, unknown>;
  setEditedSubmission: (data: Record<string, unknown>) => void;
  CATEGORY_OPTIONS: Array<{ label: string; value: string }>;
  COUNTY_OPTIONS: string[];
  onSuccess: () => void;
  onUpdateRequestHandled?: () => void;
  user: User | null;
  dashboardRefreshVersion: number;
  highlightedCommentId?: string | null;
  selectedResourceId?: string | null;
};

export default function AdminTabs(props: Props) {
  const { adminSection, resourcesSubtab, messagesSubtab, editingId, search, sortOrder } = useAdminStore();

  const {
    editedSubmission,
    setEditedSubmission,
    CATEGORY_OPTIONS,
    COUNTY_OPTIONS,
    onSuccess,
  } = props;

  if (adminSection === "dashboard") {
    return (
      <DashboardOverview
        user={props.user}
        refreshVersion={props.dashboardRefreshVersion}
      />
    );
  }

  if (adminSection === "resources") {
    if (resourcesSubtab === "pending") {
      return (
        <PendingTab
          editedSubmission={editedSubmission}
          setEditedSubmission={setEditedSubmission}
          CATEGORY_OPTIONS={CATEGORY_OPTIONS}
          COUNTY_OPTIONS={COUNTY_OPTIONS}
          onSuccess={onSuccess}
          user={props.user}
          highlightedCommentId={props.highlightedCommentId}
        />
      );
    }

    if (resourcesSubtab === "rejected") {
      return (
        <RejectedTab
          editedSubmission={editedSubmission}
          setEditedSubmission={setEditedSubmission}
          CATEGORY_OPTIONS={CATEGORY_OPTIONS}
          COUNTY_OPTIONS={COUNTY_OPTIONS}
          onSuccess={onSuccess}
          user={props.user}
          highlightedCommentId={props.highlightedCommentId}
        />
      );
    }

    return (
      <ResourcesTab
        key={`${adminSection}-${resourcesSubtab}-${sortOrder}-${search}`}
        CATEGORY_OPTIONS={CATEGORY_OPTIONS}
        COUNTY_OPTIONS={COUNTY_OPTIONS}
        onSuccess={onSuccess}
        highlightedCommentId={props.highlightedCommentId}
        selectedResourceId={editingId}
      />
    );
  }

  if (adminSection === "quality" || adminSection === "improvements") {
    return <SuggestedImprovementsPanel />;
  }

if (adminSection === "settings") {
  return <AdminSettingsPage />;
}

if (adminSection === "events") {
  return <EventsTab />;
}

if (adminSection === "messages") {
  if (messagesSubtab === "admin-team") {
    return (
      <div className="bg-surface border border-border rounded-xl p-5 text-sm text-text-muted">
        Internal admin messaging is coming soon.
      </div>
    );
  }

  return <MessagesTab />;
}


if (adminSection === "update-requests") {
  return <UpdateRequestsTab onHandled={props.onUpdateRequestHandled} />;
}

if (adminSection === "notifications") {
  return <NotificationsPanel user={props.user} />;
}

  return null;
}