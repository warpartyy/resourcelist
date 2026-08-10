"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Folder,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Bell,
  Sparkles,
  Calendar,
  Settings,
  Search,
  BarChart3,
  Lightbulb,
  PieChart,
  Compass,
} from "lucide-react";
import type { ComponentType } from "react";
import AdminControls from "@/components/admin/AdminControls";
import { useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAdminStore } from "@/lib/stores/adminStore";

type Profile = {
  display_name: string | null;
};

type AdminSection =
  | "dashboard"
  | "resources"
  | "quality"
  | "update-requests"
  | "settings"
  | "events"
  | "messages"
  | "notifications"
  | "improvements"
  | "search-lab"
  | "directory-coverage"
  | "resource-discovery"
  | "resource-guide-intelligence"
  | "resource-guide-advisor";

const SECTION_TITLES: Record<AdminSection, string> = {
  dashboard: "Dashboard",
  resources: "Resources",
  quality: "Quality",
  "update-requests": "Update Requests",
  improvements: "Suggested Improvements",
  messages: "Messages",
  events: "Events",
  notifications: "Notifications",
  settings: "Settings",
  "search-lab": "Search Lab",
  "directory-coverage": "Directory Coverage",
  "resource-discovery": "Resource Discovery",
  "resource-guide-intelligence": "Resource Guide Intelligence",
  "resource-guide-advisor": "Resource Guide Advisor",
};

const SECTION_DESCRIPTIONS: Partial<Record<AdminSection, string>> = {
  dashboard: "Your command center for admin activity and quick actions.",
  resources: "Review pending, approved, and rejected resources.",
  quality: "Improve resource quality with focused tasks.",
  messages: "Review community messages and team communication.",
  events: "Review and manage submitted events.",
  notifications: "Notifications",
  settings: "Manage admin settings and system configuration.",
  "update-requests": "Review requested updates to existing resources.",
  improvements: "Actionable resource improvement tasks.",
  "search-lab": "Inspect deterministic resource search behavior.",
  "directory-coverage": "Compare directory coverage with Resource Guide demand.",
  "resource-discovery": "Identify organizations for human review.",
  "resource-guide-intelligence": "Privacy-conscious Resource Guide analytics.",
  "resource-guide-advisor": "Actionable Resource Guide improvement recommendations.",
};

type Props = {
  adminSection: AdminSection;
  setAdminSection: (section: AdminSection) => void;
  onLogout: () => void;
  pendingCount?: number;
  resourceCount?: number;
  rejectedCount?: number;
  children: React.ReactNode;
  notificationsCount?: number;

};

export default function AdminLayout({
  adminSection,
  setAdminSection,
  onLogout,
  pendingCount,
  resourceCount,
  rejectedCount,
  children,
  notificationsCount,
}: Props){
  const pathname = usePathname();
  const router = useRouter();
  const {
    search,
    setSearch,
    sortOrder,
    setSortOrder,
    resourcesSubtab,
    setResourcesSubtab,
    messagesSubtab,
    setMessagesSubtab,
    qualitySubtab,
    setQualitySubtab,
  } = useAdminStore();

  const [collapsed, setCollapsed] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

useEffect(() => {
  const loadUser = async () => {
    const supabase = getSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single<Profile>();

    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    } else {
      setDisplayName(user.email || null);
    }
  };

  loadUser();
}, []);

  const navItem = (
    label: string,
    value: AdminSection,
    Icon: ComponentType<{ size?: number; strokeWidth?: number }>,
    count?: number
  ) => {
    const standaloneRoute =
      value === "search-lab"
        ? "/admin/search-lab"
        : value === "directory-coverage"
          ? "/admin/directory-coverage"
        : value === "resource-discovery"
          ? "/admin/resource-discovery"
        : value === "resource-guide-intelligence"
          ? "/admin/resource-guide/intelligence"
          : value === "resource-guide-advisor"
            ? "/admin/resource-guide/advisor"
            : null;

    const isActive =
      adminSection === value ||
      pathname === standaloneRoute;


    
return (
  <button
    onClick={() => {
      if (standaloneRoute) {
        router.push(standaloneRoute);
        return;
      }

      setAdminSection(value);

      if (
        pathname === "/admin/search-lab" ||
        pathname === "/admin/directory-coverage" ||
        pathname === "/admin/resource-discovery" ||
        pathname === "/admin/resource-guide/intelligence" ||
        pathname === "/admin/resource-guide/advisor"
      ) {
        router.push(`/admin?tab=${value}`);
      }
    }}
    className={`group flex items-center gap-2.5 w-full pl-4 pr-3 py-1.5 rounded-lg transition-colors duration-150 relative
      ${
        isActive
          ? "bg-teal-50 text-teal-900 font-medium"
          : "text-text-muted hover:bg-teal-50 hover:text-teal-800"
      }`}
  >
    {isActive && (
      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-accent" />
    )}

    <span
      className={`transition-colors duration-150 ${
        isActive ? "text-teal-700" : "text-text-muted group-hover:text-teal-800"
      }`}
    >
      <Icon size={18} strokeWidth={2} />
    </span>

    {!collapsed && (
      <>
        <span className="flex-1 text-left">{label}</span>

        {count !== undefined && (
          <span className="text-[11px] leading-4 bg-bg border border-border px-1.5 py-0.5 rounded-full text-text-muted">
            {count}
          </span>
        )}
      </>
    )}
  </button>
);

};

  const subNavItem = (
    label: string,
    isActive: boolean,
    onClick: () => void,
    count?: number
  ) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full pl-10 pr-3 py-1.5 rounded-lg transition-colors duration-150 ${
        isActive
          ? "bg-teal-50 text-teal-900 font-medium"
          : "text-text-muted hover:bg-teal-50 hover:text-teal-800"
      }`}
    >
      <span className="flex-1 text-left text-sm">{label}</span>

      {count !== undefined && (
        <span className="text-[11px] leading-4 bg-bg border border-border px-1.5 py-0.5 rounded-full text-text-muted">
          {count}
        </span>
      )}
    </button>
  );

  const sectionHeader = (label: string) =>
    collapsed ? (
      <div className="my-3 border-t border-border" aria-hidden="true" />
    ) : (
      <div className="px-3 pt-3.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-text-subtle">
        {label}
      </div>
    );

return (
  <div className="h-screen flex overflow-hidden bg-bg text-text-primary relative">
    {/* Sidebar */}
    <div
      className={`
        fixed md:relative z-40
        ${
          collapsed
            ? "-translate-x-full md:translate-x-0 md:w-20"
            : "translate-x-0 md:w-64"
        }
        w-64 h-full bg-surface border-r border-border p-4 flex flex-col
        transition-all duration-300
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {!collapsed && (
          <div>
            <h2 className="text-lg font-semibold">Admin</h2>

            {displayName && (
              <p className="text-xs text-text-muted mt-1">
                Logged in as {displayName}
              </p>
            )}
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-text-muted hover:text-text-primary transition"
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <div className="space-y-1.5">
        {sectionHeader("Operations")}
        {navItem("Dashboard", "dashboard", Home)}

        {navItem("Resources", "resources", Folder)}
        {!collapsed && (
          <div className="space-y-1">
            {subNavItem("Pending", resourcesSubtab === "pending", () => {
              setAdminSection("resources");
              setResourcesSubtab("pending");
            }, pendingCount)}
            {subNavItem("Approved", resourcesSubtab === "approved", () => {
              setAdminSection("resources");
              setResourcesSubtab("approved");
            }, resourceCount)}
            {subNavItem("Rejected", resourcesSubtab === "rejected", () => {
              setAdminSection("resources");
              setResourcesSubtab("rejected");
            }, rejectedCount)}
          </div>
        )}

        {navItem("Quality", "quality", Sparkles)}
        {!collapsed && (
          <div className="space-y-1">
            {subNavItem("Suggested Improvements", adminSection === "quality" && qualitySubtab === "improvements", () => {
              setAdminSection("quality");
              setQualitySubtab("improvements");
            })}
          </div>
        )}

        {navItem("Messages", "messages", MessageSquare)}
        {!collapsed && (
          <div className="space-y-1">
            {subNavItem("Community", messagesSubtab === "community", () => {
              setAdminSection("messages");
              setMessagesSubtab("community");
            })}
            {subNavItem("Admin Team", messagesSubtab === "admin-team", () => {
              setAdminSection("messages");
              setMessagesSubtab("admin-team");
            })}
          </div>
        )}

        {navItem("Notifications", "notifications", Bell, notificationsCount)}
        {navItem("Events", "events", Calendar)}

        {sectionHeader("Resource Guide Insights")}
        {navItem("Search Lab", "search-lab", Search)}
        {navItem("Directory Coverage", "directory-coverage", PieChart)}
        {navItem("Resource Discovery", "resource-discovery", Compass)}
        {navItem("Insights", "resource-guide-intelligence", BarChart3)}
        {navItem("Advisor", "resource-guide-advisor", Lightbulb)}

        {sectionHeader("Settings")}
        {navItem("Settings", "settings", Settings)}
      </div>

      {/* Logout */}
      <div className="mt-auto border-t border-border pt-4">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-bg text-text-muted transition"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>

    {/* Mobile overlay */}
    {!collapsed && (
      <div
        className="fixed inset-0 bg-black/40 z-30 md:hidden"
        onClick={() => setCollapsed(true)}
      />
    )}

    {/* Main Content */}
    <div className="flex-1 h-full flex flex-col bg-bg">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-bg shadow-sm">
        <div className="px-4 md:px-10 pt-6 md:pt-8 pb-4 flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={() => setCollapsed(false)}
            className="md:hidden p-2 rounded-lg border border-border"
          >
            <ChevronRight size={18} />
          </button>

<div>
  <h1 className="text-xl md:text-2xl font-semibold">
    {SECTION_TITLES[adminSection]}
  </h1>

  {SECTION_DESCRIPTIONS[adminSection] && (
    <p className="text-sm text-text-muted mt-1">
      {SECTION_DESCRIPTIONS[adminSection]}
    </p>
  )}
</div>

        </div>
      </div>

      {/* Controls */}
      {adminSection === "resources" && (
        <AdminControls
          search={search}
          setSearch={setSearch}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 md:px-10 pt-4 md:pt-6 pb-8 md:pb-10">
          {children}
        </div>
      </div>
    </div>
  </div>
);
}
