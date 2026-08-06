"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminTabs from "@/components/admin/tabs/AdminTabs";
import { fetchAdminCounts } from "@/lib/services/adminService";
import { COUNTY_OPTIONS_BY_STATE } from "@/lib/geography/counties";
import { getSupabase } from "@/lib/supabase";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import {
  AdminSection,
  MessagesSubtab,
  ResourcesSubtab,
  useAdminStore,
} from "@/lib/stores/adminStore";

const CATEGORY_OPTIONS = [
  { label: "Mental Health", value: "mental-health" },
  { label: "Substance Use", value: "substance-use" },
  { label: "Food Assistance", value: "food-assistance" },
  { label: "Housing Support", value: "housing-support" },
  { label: "Transportation Services", value: "transportation-services" },
  { label: "Employment Services", value: "employment-services" },
];

const COUNTY_OPTIONS = COUNTY_OPTIONS_BY_STATE["OK"] ?? [];

const VALID_TABS: AdminSection[] = [
  "dashboard",
  "update-requests",
  "resources",
  "quality",
  "settings",
  "events",
  "messages",
  "notifications",
  "search-lab",
];

const RESOURCE_SUBTABS: ResourcesSubtab[] = ["pending", "approved", "rejected"];
const MESSAGE_SUBTABS: MessagesSubtab[] = ["community", "admin-team"];

const isResourceSubtab = (value: string | null): value is ResourcesSubtab => {
  if (!value) return false;
  return RESOURCE_SUBTABS.includes(value as ResourcesSubtab);
};

const isMessagesSubtab = (value: string | null): value is MessagesSubtab => {
  if (!value) return false;
  return MESSAGE_SUBTABS.includes(value as MessagesSubtab);
};

const isValidTab = (value: string | null): value is AdminSection => {
  if (!value) return false;
  return VALID_TABS.includes(value as AdminSection);
};

const isLegacyTab = (value: string | null): value is "pending" | "rejected" | "improvements" => {
  if (!value) return false;
  return value === "pending" || value === "rejected" || value === "improvements";
};

export default function AdminPage() {
  const searchParams = useSearchParams();
  const [dashboardRefreshVersion, setDashboardRefreshVersion] = useState(0);

  const [counts, setCounts] = useState({
    pending: 0,
    rejected: 0,
    resources: 0,
    updateRequests: 0,
    notifications: 0,
  });

  const router = useRouter();
  const subtabFromUrl = searchParams.get("subtab");
  const rawResource = searchParams.get("resource");
  const resourceFromUrl = rawResource && rawResource !== "null" ? rawResource : null;
  const [editedSubmission, setEditedSubmission] = useState<Record<string, unknown>>({});
  const tabFromUrl = searchParams.get("tab");
  const sectionFromUrl = searchParams.get("section");
  const requestedTab = isValidTab(tabFromUrl)
    ? tabFromUrl
    : isLegacyTab(tabFromUrl)
      ? tabFromUrl
      : isValidTab(sectionFromUrl)
        ? sectionFromUrl
        : isLegacyTab(sectionFromUrl)
          ? sectionFromUrl
          : null;

  const resolvedTab: AdminSection = (() => {
    if (!requestedTab) return "dashboard";

    if (requestedTab === "improvements") return "quality";
    if (requestedTab === "pending") return "resources";
    if (requestedTab === "rejected") return "resources";

    return requestedTab;
  })();

  const resolvedResourcesSubtab: ResourcesSubtab = (() => {
    if (requestedTab === "pending") return "pending";
    if (requestedTab === "rejected") return "rejected";

    if (resolvedTab === "resources") {
      if (isResourceSubtab(subtabFromUrl)) {
        return subtabFromUrl;
      }
      return "approved";
    }

    return "pending";
  })();

  const resolvedMessagesSubtab: MessagesSubtab = (() => {
    if (resolvedTab !== "messages") {
      return "community";
    }

    if (isMessagesSubtab(subtabFromUrl)) {
      return subtabFromUrl;
    }

    return "community";
  })();

  const {
    adminSection,
    setAdminSection,
    resourcesSubtab,
    setResourcesSubtab,
    messagesSubtab,
    setMessagesSubtab,
    qualitySubtab,
    setQualitySubtab,
    setEditingId,
  } = useAdminStore();

  useEffect(() => {
    setAdminSection(resolvedTab);
    setResourcesSubtab(resolvedResourcesSubtab);
    setMessagesSubtab(resolvedMessagesSubtab);
    setQualitySubtab("improvements");
  }, [
    resolvedTab,
    resolvedResourcesSubtab,
    resolvedMessagesSubtab,
    setAdminSection,
    setResourcesSubtab,
    setMessagesSubtab,
    setQualitySubtab,
  ]);

  const { user } = useCurrentUser();

  const handleLogout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const commentFromUrl = searchParams.get("comment");

  const refreshAll = async () => {
    await fetchCounts();
    setDashboardRefreshVersion((prev) => prev + 1);
  };

  useEffect(() => {
    if (!resourceFromUrl) {
      setEditingId(null);
      return;
    }

    setEditingId(resourceFromUrl);
  }, [resourceFromUrl, setEditingId]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("tab", adminSection);

    if (adminSection === "resources") {
      params.set("subtab", resourcesSubtab);
    } else if (adminSection === "messages") {
      params.set("subtab", messagesSubtab);
    } else if (adminSection === "quality") {
      params.set("subtab", qualitySubtab);
    } else {
      params.delete("subtab");
    }

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery !== currentQuery) {
      router.replace(`/admin?${nextQuery}`);
    }
  }, [
    adminSection,
    resourcesSubtab,
    messagesSubtab,
    qualitySubtab,
    router,
    searchParams,
  ]);

  const fetchCounts = async () => {
    try {
      const supabase = getSupabase();

      const nextCounts = await fetchAdminCounts();

      setCounts((prev) => ({
        ...prev,
        ...nextCounts,
      }));

      let notificationCount = 0;

      if (user?.id) {
        const { count } = await supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("read", false);

        notificationCount = count || 0;
      }

      setCounts((prev) => ({
        ...prev,
        notifications: notificationCount,
      }));
    } catch (err) {
      console.error("Failed to fetch counts", err);
    }
  };

  const decrementUpdateRequests = () => {
    setCounts((prev) => ({
      ...prev,
      updateRequests: Math.max(0, prev.updateRequests - 1),
    }));
  };

  useEffect(() => {
    fetchCounts();
  }, [user?.id]);

  return (
    <AdminLayout
      adminSection={adminSection}
      setAdminSection={setAdminSection}
      onLogout={handleLogout}
      pendingCount={counts.pending}
      resourceCount={counts.resources}
      rejectedCount={counts.rejected}
      notificationsCount={counts.notifications}
    >
      <AdminTabs
        editedSubmission={editedSubmission}
        setEditedSubmission={setEditedSubmission}
        CATEGORY_OPTIONS={CATEGORY_OPTIONS}
        COUNTY_OPTIONS={COUNTY_OPTIONS}
        onSuccess={refreshAll}
        onUpdateRequestHandled={decrementUpdateRequests}
        user={user}
        dashboardRefreshVersion={dashboardRefreshVersion}
        highlightedCommentId={commentFromUrl}
      />
    </AdminLayout>
  );
}
