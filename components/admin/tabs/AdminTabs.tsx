"use client";

import PendingTab from "./PendingTab";
import RejectedTab from "./RejectedTab";
import ResourcesTab from "./ResourcesTab";
import AdminSettingsPage from "@/app/admin/settings/page";
import EventsTab from "./EventsTab";
import MessagesTab from "@/app/admin/components/MessagesTab";
import UpdateRequestsTab from "./UpdateRequestsTab";
import NotificationsPanel from "@/components/admin/NotificationsPanel";

type Props = {
adminSection:
  | "pending"
  | "update-requests"
  | "rejected"
  | "resources"
  | "settings"
  | "events"
  | "messages"
  | "notifications";

  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
  CATEGORY_OPTIONS: any[];
  COUNTY_OPTIONS: string[];
  onSuccess: () => void;
  sortOrder: "az" | "za" | "newest" | "oldest";
  setSortOrder: (value: "az" | "za" | "newest" | "oldest") => void;
  search: string;
  setSearch: (value: string) => void;
  onUpdateRequestHandled?: () => void;
  user: any;
  highlightedCommentId?: string | null;
  selectedResourceId?: string | null;
};

export default function AdminTabs(props: Props) {
  const {
    adminSection,
    editingId,
    setEditingId,
    editedSubmission,
    setEditedSubmission,
    CATEGORY_OPTIONS,
    COUNTY_OPTIONS,
    onSuccess,
    sortOrder,
    setSortOrder,
    search,
    setSearch,
  } = props;

  if (adminSection === "pending") {
    return (
      <PendingTab
        editingId={editingId}
        setEditingId={setEditingId}
        editedSubmission={editedSubmission}
        setEditedSubmission={setEditedSubmission}
        CATEGORY_OPTIONS={CATEGORY_OPTIONS}
        COUNTY_OPTIONS={COUNTY_OPTIONS}
        onSuccess={onSuccess}
        search={search}
        sortOrder={sortOrder}
      />
    );
  }

  if (adminSection === "rejected") {
    return (
      <RejectedTab
        editingId={editingId}
        setEditingId={setEditingId}
        editedSubmission={editedSubmission}
        setEditedSubmission={setEditedSubmission}
        CATEGORY_OPTIONS={CATEGORY_OPTIONS}
        COUNTY_OPTIONS={COUNTY_OPTIONS}
        onSuccess={onSuccess}
        search={search}
        sortOrder={sortOrder}
      />
    );
  }
 
if (adminSection === "resources") {
  return (
    <ResourcesTab
      key={`${adminSection}-${sortOrder}-${search}`}
      adminSection={adminSection}
      CATEGORY_OPTIONS={CATEGORY_OPTIONS}
      COUNTY_OPTIONS={COUNTY_OPTIONS}
      sortOrder={sortOrder}
      setSortOrder={setSortOrder}
      onSuccess={onSuccess}
      search={search}

      // 🔥 CRITICAL FIX
      editingId={editingId}
      setEditingId={setEditingId}

      highlightedCommentId={props.highlightedCommentId}
      selectedResourceId={editingId} 
    />
  );
}

if (adminSection === "settings") {
  return <AdminSettingsPage />;
}

if (adminSection === "events") {
  return <EventsTab />;
}

if (adminSection === "messages") {
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