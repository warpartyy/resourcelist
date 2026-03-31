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
    comment_preview?: string | null;
};

export default function NotificationsPanel({ user }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();



const handleNotificationClick = async (n: Notification) => {
  console.log("HANDLER START");

  // 🔥 1. OPTIMISTIC UPDATE (instant UI)
  setNotifications((prev) =>
    prev.map((notif) =>
      notif.id === n.id ? { ...notif, read: true } : notif
    )
  );

  const supabase = getSupabase();

  // 🔥 2. FIRE AND FORGET DB UPDATE
  const updatePromise = supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", n.id);

  if (!n.resource_id) {
    console.error("Missing resource_id on notification", n);
    return;
  }

  const url = `/admin?section=resources&resource=${n.resource_id}${
    n.comment_id ? `&comment=${n.comment_id}` : ""
  }`;

  console.log("NAVIGATING TO:", url);

  // 🔥 3. NAVIGATE IMMEDIATELY
  window.location.assign(url);

  // 🔍 4. HANDLE ERROR LATER
  updatePromise.then(({ error }) => {
    if (error) {
      console.error("Failed to mark notification as read:", error);
    }
  });
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

      setNotifications(data || []);
      setLoading(false);
    };

    fetchNotifications();
  }, [user.id]);

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
        onClick={(e) => {
          e.stopPropagation();
          handleNotificationClick(n);
        }}
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