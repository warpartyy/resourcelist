"use client";

import NotificationsPanel from "@/components/admin/NotificationsPanel";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export default function NotificationsPage() {
  const { user, loading } = useCurrentUser();

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    return <div className="p-6">Not authenticated</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Notifications</h1>

      <NotificationsPanel user={user} />
    </div>
  );
}