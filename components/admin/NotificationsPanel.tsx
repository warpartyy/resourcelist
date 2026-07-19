"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  deleteAllNotifications,
  deleteNotifications,
} from "@/lib/services/comments/notificationService";
import { navigateToAdminResource } from "@/lib/services/admin/resourceNavigationService";
import type { User } from "@supabase/supabase-js";

type Props = {
  user: User | null;
  onNotificationsChanged?: () => void;
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

export default function NotificationsPanel({ user, onNotificationsChanged }: Props) {
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
    return;
  }

  await onNotificationsChanged?.();
};

const handleViewNotification = async (n: Notification) => {
  if (!n.resource_id || !n.comment_id) {
    return;
  }

  const navigation = await navigateToAdminResource({
    router,
    resourceId: n.resource_id,
    commentId: n.comment_id,
  });

  if (!navigation.ok) {
    toast.error("Unable to open notification");
    return;
  }

  await handleNotificationClick(n);
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
  await onNotificationsChanged?.();
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
  await onNotificationsChanged?.();
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
    <div className="bg-surface border border-border rounded-xl p-3 flex flex-wrap items-center gap-4">
      <label className="inline-flex items-center gap-2 text-sm text-text-primary">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleSelectAll}
          className="h-4 w-4"
        />
        <span>Select All</span>
      </label>

      <div className="text-sm text-text-muted">
        {notifications.length} {notifications.length === 1 ? "notification" : "notifications"}
      </div>

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
        className={`relative p-4 rounded-xl border transition
          ${
            n.read
              ? "bg-surface border-border"
              : "bg-yellow-50 border-yellow-200"
          }
        `}
      >
        <div className="absolute right-3 top-3 z-10">
          <input
            type="checkbox"
            checked={selectedIds.includes(n.id)}
            onChange={() => toggleSelected(n.id)}
            className="h-4 w-4"
          />
        </div>

        {/* 🔴 Unread indicator */}
        {!n.read && (
          <span className="absolute left-2 top-4 w-2 h-2 bg-yellow-500 rounded-full" />
        )}

        <div className="flex justify-between items-start gap-4 pr-7">
          <div className={`text-sm leading-relaxed flex-1 ${n.read ? "text-text-primary" : "text-text-primary font-semibold"}`}>
            {n.message || "New notification"}
          </div>

          <div className="text-xs text-text-muted whitespace-nowrap pt-0.5">
            {n.created_at
              ? formatRelativeTime(n.created_at)
              : ""}
          </div>
        </div>

        {n.comment_preview && (
          <div className="mt-3 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-muted line-clamp-3">
            “{n.comment_preview}”
          </div>
        )}

        <div className="mt-3 flex items-center gap-3">
          {(n.comment_id && n.resource_id) && (
            <button
              type="button"
              onClick={() => handleViewNotification(n)}
              className="text-xs text-accent hover:underline"
            >
              View Comment →
            </button>
          )}

          {!n.read && (
            <button
              type="button"
              onClick={() => handleNotificationClick(n)}
              className="text-xs text-text-muted hover:underline"
            >
              Mark as Read
            </button>
          )}
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