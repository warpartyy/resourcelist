"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Props = {
  user: any;
};

type Notification = {
  id: string;
  message: string | null;
  read: boolean | null;
  created_at: string | null;
  resource_id: string | null;
  comment_id: string | null;
  section?: "pending" | "resources" | "rejected"; // optional
  comment_preview?: string | null; // ✅ ADD THIS
};

export default function NotificationsPanel({ user }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();



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


function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

  return date.toLocaleDateString();
}


useEffect(() => {
  const fetchNotifications = async () => {
    if (!user?.id) {
      setLoading(false); // 🔥 FIX: stop loading if no user yet
      return;
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      setLoading(false);
      return;
    }

    console.log("NOTIFICATIONS:", data);

    setNotifications(data || []);
    setLoading(false); // 🔥 ensure this always runs
  };

  fetchNotifications();
}, [user?.id]);



  if (loading) {
    return <div className="text-sm text-gray-500">Loading notifications...</div>;
  }

  if (notifications.length === 0) {
    return <div className="text-sm text-gray-500">No notifications yet.</div>;
  }

  return (
  <div className="space-y-3">
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
      >
        {/* 🔴 Unread indicator */}
        {!n.read && (
          <span className="absolute left-2 top-4 w-2 h-2 bg-yellow-500 rounded-full" />
        )}

        <div className="flex justify-between items-start gap-4">
          {/* Message */}
<div className="text-sm text-text-primary leading-relaxed">
  {n.message || "New notification"}
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
  </div>
);
}