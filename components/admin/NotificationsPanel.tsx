"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  deleteAllNotifications,
  deleteNotifications,
  getResourceStatusById,
} from "@/lib/services/comments/notificationService";

type Props = {
  user: {
    id: string;
  };
};

type Notification = {
  id: string;
  message: string | null;
  type: string;
  read: boolean | null;
  created_at: string | null;
  resource_id: string | null;
  comment_id: string | null;
  section?: "pending" | "resources" | "rejected"; // optional
  comment_preview?: string | null; // ✅ ADD THIS
};

function mapStatusToTab(status: string | null | undefined): "pending" | "resources" | "rejected" {
  if (status === "approved") return "resources";
  if (status === "rejected") return "rejected";
  return "pending";
}

export default function NotificationsPanel({ user }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDeleteAllOpen, setConfirmDeleteAllOpen] = useState(false);
  const [deletingSelected, setDeletingSelected] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const router = useRouter();

  const getNotifications = async (userId: string) => {
    const supabase = getSupabase();

    return supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
  };

  const refreshNotifications = async () => {
    if (!user?.id) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const { data, error } = await getNotifications(user.id);

    if (error) {
      console.error("Error fetching notifications:", error);
      setLoading(false);
      return;
    }

    setNotifications(data || []);
    setLoading(false);
  };

const handleNotificationClick = async (n: Notification) => {
  // ✅ optimistic UI
  setNotifications((prev) =>
    prev.map((notif) =>
      notif.id === n.id ? { ...notif, read: true } : notif
    )
  );

  const supabase = getSupabase();

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", n.id);

  if (error) {
    console.error("Failed to mark notification as read:", error);
  }
};

const handleViewNotification = async (n: Notification) => {
  await handleNotificationClick(n);

  if (!n.resource_id || !n.comment_id) {
    return;
  }

  let tabFromNotification = n.section;

  if (!tabFromNotification) {
    const { data, error } = await getResourceStatusById(n.resource_id);

    if (error) {
      console.error("Failed to resolve notification resource status:", error);
      toast.error("Unable to open notification");
      return;
    }

    tabFromNotification = mapStatusToTab(data?.status);
  }

  const tab = tabFromNotification || "pending";

  router.push(`/admin?tab=${tab}&resource=${n.resource_id}&comment=${n.comment_id}`);
};


function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

  return date.toLocaleDateString();
}

const allSelected =
  notifications.length > 0 && selectedIds.length === notifications.length;

const toggleSelected = (id: string) => {
  setSelectedIds((prev) =>
    prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]
  );
};

const toggleSelectAll = () => {
  if (allSelected) {
    setSelectedIds([]);
    return;
  }

  setSelectedIds(notifications.map((n) => n.id));
};

const handleDeleteSelected = async () => {
  if (!user?.id || selectedIds.length === 0 || deletingSelected) return;

  setDeletingSelected(true);

  const { error } = await deleteNotifications(selectedIds, user.id);

  if (error) {
    console.error("Failed to delete selected notifications:", error);
    toast.error("Unable to delete selected notifications");
    setDeletingSelected(false);
    return;
  }

  await refreshNotifications();
  setSelectedIds([]);
  toast.success("Selected notifications deleted");
  setDeletingSelected(false);
};

const handleDeleteAll = async () => {
  if (!user?.id || deletingAll) return;

  setDeletingAll(true);

  const { error } = await deleteAllNotifications(user.id);

  if (error) {
    console.error("Failed to delete notifications:", error);
    toast.error("Unable to delete notifications");
    setDeletingAll(false);
    return;
  }

  await refreshNotifications();
  setSelectedIds([]);
  setConfirmDeleteAllOpen(false);
  toast.success("All notifications deleted");
  setDeletingAll(false);
};


useEffect(() => {
  let cancelled = false;

  const run = async () => {
    if (!user?.id) {
      if (!cancelled) {
        setNotifications([]);
        setLoading(false);
      }
      return;
    }

    const { data, error } = await getNotifications(user.id);

    if (cancelled) return;

    if (error) {
      console.error("Error fetching notifications:", error);
      setLoading(false);
      return;
    }

    setNotifications(data || []);
    setLoading(false);
  };

  run();

  return () => {
    cancelled = true;
  };
}, [user?.id]);



  if (loading) {
    return <div className="text-sm text-gray-500">Loading notifications...</div>;
  }

  if (notifications.length === 0) {
    return <div className="text-sm text-gray-500">No notifications yet.</div>;
  }

  return (
  <div className="space-y-3">
    <div className="bg-surface border border-border rounded-xl p-3 flex flex-wrap items-center gap-3">
      <label className="inline-flex items-center gap-2 text-sm text-text-primary">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleSelectAll}
          className="h-4 w-4"
        />
        <span>Select All</span>
      </label>

      <button
        type="button"
        onClick={handleDeleteSelected}
        disabled={selectedIds.length === 0 || deletingSelected}
        className="button button-secondary px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {deletingSelected ? "Deleting..." : "Delete Selected"}
      </button>

      <button
        type="button"
        onClick={() => setConfirmDeleteAllOpen(true)}
        disabled={deletingAll}
        className="button button-danger px-3 py-2 text-sm"
      >
        Delete All
      </button>
    </div>

    {notifications.map((n) => (
      <div
        key={n.id}
        className={`group relative p-4 rounded-xl border cursor-pointer transition
          ${
            n.read
              ? "bg-surface border-border hover:bg-muted"
              : "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
          }
        `}
        onClick={() => handleNotificationClick(n)}
      >
        <div className="absolute right-3 top-3 z-10">
          <input
            type="checkbox"
            checked={selectedIds.includes(n.id)}
            onChange={() => toggleSelected(n.id)}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4"
          />
        </div>

        {/* 🔴 Unread indicator */}
        {!n.read && (
          <span className="absolute left-2 top-4 w-2 h-2 bg-yellow-500 rounded-full" />
        )}

        <div className="flex justify-between items-start gap-4">
          {/* Message */}
<div className="text-sm text-text-primary leading-relaxed flex-1">
  <div>{n.message || "New notification"}</div>

  {(n.comment_id && n.resource_id) && (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        handleViewNotification(n);
      }}
      className="mt-2 text-xs text-accent hover:underline"
    >
      View Notification
    </button>
  )}
</div>

{n.comment_preview && (
  <div className="text-sm text-text-muted mt-1 line-clamp-2">
    “{n.comment_preview}”
  </div>
)}

          {/* Time */}
          <div className="text-xs text-text-muted whitespace-nowrap">
            {n.created_at
              ? formatRelativeTime(n.created_at)
              : ""}
          </div>
        </div>

        {/* Subtle action hint */}
        <div className="text-xs text-text-muted mt-2 opacity-0 group-hover:opacity-100 transition">
          Click to view →
        </div>
      </div>
    ))}

    {confirmDeleteAllOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-xl">
          <p className="text-base font-semibold text-text-primary">
            Delete all notifications?
          </p>

          <p className="mt-2 text-sm text-text-muted">
            This action cannot be undone.
          </p>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmDeleteAllOpen(false)}
              disabled={deletingAll}
              className="button button-secondary px-3 py-2 text-sm"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDeleteAll}
              disabled={deletingAll}
              className="button button-danger px-3 py-2 text-sm"
            >
              {deletingAll ? "Deleting..." : "Delete All"}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}