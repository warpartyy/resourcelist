"use client";

import PendingTab from "./PendingTab";
import RejectedTab from "./RejectedTab";
import ResourcesTab from "./ResourcesTab";
import AdminSettingsPage from "@/app/admin/settings/page";
import EventsTab from "./EventsTab";
import MessagesTab from "@/app/admin/components/MessagesTab";
import UpdateRequestsTab from "./UpdateRequestsTab";
import NotificationsPanel from "@/components/admin/NotificationsPanel";
import { useAdminStore } from "@/lib/stores/adminStore";

type Props = {
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
  CATEGORY_OPTIONS: any[];
  COUNTY_OPTIONS: string[];
  onSuccess: () => void;
  onUpdateRequestHandled?: () => void;
  user: any;
  highlightedCommentId?: string | null;
  selectedResourceId?: string | null;
};

export default function AdminTabs(props: Props) {
  const { adminSection, editingId, setEditingId, search, sortOrder, setSortOrder } = useAdminStore();

  const {
    editedSubmission,
    setEditedSubmission,
    CATEGORY_OPTIONS,
    COUNTY_OPTIONS,
    onSuccess,
  } = props;

  if (adminSection === "pending") {
    return (
      <PendingTab
        editedSubmission={editedSubmission}
        setEditedSubmission={setEditedSubmission}
        CATEGORY_OPTIONS={CATEGORY_OPTIONS}
        COUNTY_OPTIONS={COUNTY_OPTIONS}
        onSuccess={onSuccess}
        highlightedCommentId={props.highlightedCommentId}
      />
    );
  }

  if (adminSection === "rejected") {
    return (
      <RejectedTab
        editedSubmission={editedSubmission}
        setEditedSubmission={setEditedSubmission}
        CATEGORY_OPTIONS={CATEGORY_OPTIONS}
        COUNTY_OPTIONS={COUNTY_OPTIONS}
        onSuccess={onSuccess}
        highlightedCommentId={props.highlightedCommentId}
      />
    );
  }
 
if (adminSection === "resources") {
  return (
    <ResourcesTab
      key={`${adminSection}-${sortOrder}-${search}`}
      CATEGORY_OPTIONS={CATEGORY_OPTIONS}
      COUNTY_OPTIONS={COUNTY_OPTIONS}
      onSuccess={onSuccess}
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