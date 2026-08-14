"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Folder,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Settings,
  BarChart3,
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

type SidebarSection = "resource-management" | "community" | "analytics" | "settings";

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

const STANDALONE_ROUTES: Partial<Record<AdminSection, string>> = {
  "search-lab": "/admin/search-lab",
  "directory-coverage": "/admin/directory-coverage",
  "resource-discovery": "/admin/resource-discovery",
  "resource-guide-intelligence": "/admin/resource-guide/intelligence",
  "resource-guide-advisor": "/admin/resource-guide/advisor",
};

const DEFAULT_EXPANDED_SECTIONS: Record<SidebarSection, boolean> = {
  "resource-management": true,
  community: true,
  analytics: false,
  settings: false,
};

export default function AdminLayout({
  adminSection,
  setAdminSection,
  onLogout,
  pendingCount,
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
  const [expandedSections, setExpandedSections] = useState(DEFAULT_EXPANDED_SECTIONS);

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

  const navigateToSection = (value: AdminSection) => {
    const standaloneRoute = STANDALONE_ROUTES[value];

    if (standaloneRoute) {
      router.push(standaloneRoute);
      return;
    }

    setAdminSection(value);

    if (Object.values(STANDALONE_ROUTES).includes(pathname)) {
      router.push(`/admin?tab=${value}`);
    }
  };

  const navItem = (
    label: string,
    value: AdminSection,
    Icon?: ComponentType<{ size?: number; strokeWidth?: number }>
  ) => {
    const standaloneRoute = STANDALONE_ROUTES[value];
    const isActive = adminSection === value || pathname === standaloneRoute;

    return (
      <button
        onClick={() => navigateToSection(value)}
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

        {Icon && (
          <span
            className={`transition-colors duration-150 ${
              isActive ? "text-teal-700" : "text-text-muted group-hover:text-teal-800"
            }`}
          >
            <Icon size={18} strokeWidth={2} />
          </span>
        )}

        {!collapsed && <span className="flex-1 text-left">{label}</span>}
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

  const toggleSection = (section: SidebarSection) => {
    setExpandedSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  const sectionHeader = (
    label: string,
    section: SidebarSection,
    Icon: ComponentType<{ size?: number; strokeWidth?: number }>
  ) => {
    const isExpanded = expandedSections[section];

    return (
      <button
        type="button"
        onClick={() => toggleSection(section)}
        className={`group flex items-center gap-2.5 w-full pl-4 pr-3 py-1.5 rounded-lg text-text-muted hover:bg-teal-50 hover:text-teal-800 transition-colors duration-150 ${
          collapsed ? "justify-center px-3" : ""
        }`}
        aria-expanded={isExpanded}
      >
        <span className="text-text-muted transition-colors duration-150 group-hover:text-teal-800">
          <Icon size={18} strokeWidth={2} />
        </span>

        {!collapsed && (
          <>
            <span className="flex-1 text-left text-sm font-medium">{label}</span>
            {isExpanded ? (
              <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
            ) : (
              <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
            )}
          </>
        )}
      </button>
    );
  };

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
        {navItem("Dashboard", "dashboard", Home)}

        {sectionHeader("Resource Management", "resource-management", Folder)}
        {!collapsed && expandedSections["resource-management"] && (
          <div className="space-y-1">
            {subNavItem("Pending", adminSection === "resources" && resourcesSubtab === "pending", () => {
              setAdminSection("resources");
              setResourcesSubtab("pending");
            }, pendingCount)}
            {subNavItem("Approved", adminSection === "resources" && resourcesSubtab === "approved", () => {
              setAdminSection("resources");
              setResourcesSubtab("approved");
            })}
            {subNavItem("Rejected", adminSection === "resources" && resourcesSubtab === "rejected", () => {
              setAdminSection("resources");
              setResourcesSubtab("rejected");
            }, rejectedCount)}
            {subNavItem("Resource Discovery", pathname === STANDALONE_ROUTES["resource-discovery"], () => {
              navigateToSection("resource-discovery");
            })}
            {subNavItem("Suggested Improvements", adminSection === "quality" && qualitySubtab === "improvements", () => {
              setAdminSection("quality");
              setQualitySubtab("improvements");
            })}
          </div>
        )}

        {sectionHeader("Community", "community", MessageSquare)}
        {!collapsed && expandedSections.community && (
          <div className="space-y-1">
            {subNavItem("Community Messages", adminSection === "messages" && messagesSubtab === "community", () => {
              setAdminSection("messages");
              setMessagesSubtab("community");
            })}
            {subNavItem("Notifications", adminSection === "notifications", () => {
              navigateToSection("notifications");
            }, notificationsCount)}
            {subNavItem("Events", adminSection === "events", () => {
              navigateToSection("events");
            })}
            {subNavItem("Admin Team", adminSection === "messages" && messagesSubtab === "admin-team", () => {
              setAdminSection("messages");
              setMessagesSubtab("admin-team");
            })}
          </div>
        )}

        {sectionHeader("Analytics", "analytics", BarChart3)}
        {!collapsed && expandedSections.analytics && (
          <div className="space-y-1">
            {subNavItem("Search Lab", pathname === STANDALONE_ROUTES["search-lab"], () => {
              navigateToSection("search-lab");
            })}
            {subNavItem("Directory Coverage", pathname === STANDALONE_ROUTES["directory-coverage"], () => {
              navigateToSection("directory-coverage");
            })}
            {subNavItem("Insights", pathname === STANDALONE_ROUTES["resource-guide-intelligence"], () => {
              navigateToSection("resource-guide-intelligence");
            })}
            {subNavItem("Advisor", pathname === STANDALONE_ROUTES["resource-guide-advisor"], () => {
              navigateToSection("resource-guide-advisor");
            })}
          </div>
        )}

        {sectionHeader("Settings", "settings", Settings)}
        {!collapsed && expandedSections.settings && (
          <div className="space-y-1">
            {subNavItem("Settings", adminSection === "settings", () => {
              navigateToSection("settings");
            })}
          </div>
        )}
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
