"use client";
import { Trash } from "lucide-react";
import { useState } from "react";
import { Clock, Database, XCircle, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import AdminControls from "@/components/admin/AdminControls";
import { Settings } from "lucide-react";
import { useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { Calendar } from "lucide-react";

type Profile = {
  display_name: string | null;
};

type AdminSection =
  | "pending"
  | "resources"
  | "rejected"
  | "deleted"
  | "settings"
  | "events";

const SECTION_TITLES: Record<AdminSection, string> = {
  pending: "Pending Suggestions",
  resources: "Approved Resources",
  rejected: "Rejected",
  deleted: "Deleted Resources",
  settings: "Settings",
  events: "Pending Events",
};

type Props = {
  adminSection: AdminSection;
  setAdminSection: (section: AdminSection) => void;
  onLogout: () => void;
  pendingCount?: number;
  resourceCount?: number;
  rejectedCount?: number;
  deletedCount?: number;
  children: React.ReactNode;

  // NEW
  search: string;
  setSearch: (value: string) => void;
  sortOrder: "az" | "za" | "newest" | "oldest";
  setSortOrder: (value: "az" | "za" | "newest" | "oldest") => void;
};

export default function AdminLayout({
  adminSection,
  setAdminSection,
  onLogout,
  pendingCount,
  resourceCount,
  rejectedCount,
  deletedCount,
  children,
  search,
  setSearch,
  sortOrder,
  setSortOrder,
}: Props){

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
    Icon: any,
    count?: number
  ) => {
    const isActive = adminSection === value;


    

    return (
      <button
  onClick={() => setAdminSection(value)}
  className={`flex items-center gap-3 w-full pl-4 pr-3 py-2 rounded-lg transition relative
    ${
      isActive
        ? "bg-bg text-text-primary"
        : "hover:bg-bg text-text-muted"
    }`}
>
  {isActive && (
    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-accent" />
  )}

  <span className={isActive ? "text-accent" : "text-text-muted"}>
    <Icon size={18} strokeWidth={2} />
  </span>

  {!collapsed && (
    <>
      <span className="flex-1 text-left">{label}</span>

      {count !== undefined && (
        <span className="text-xs bg-bg border border-border px-2 py-0.5 rounded-full text-text-muted">
          {count}
        </span>
      )}
    </>
  )}
</button>

    );
  };

  return (
    <div className="h-screen flex overflow-hidden bg-bg text-text-primary">
      {/* Sidebar */}
      <div
        className={`${
        collapsed ? "w-20" : "w-64"
        } h-full bg-surface border-r border-border p-4 flex flex-col transition-all duration-300`}
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
        <div className="space-y-2">
          {navItem("Pending Suggestions", "pending", Clock, pendingCount)}
          {navItem("Approved Resources", "resources", Database, resourceCount)}
          {navItem("Rejected", "rejected", XCircle, rejectedCount)}
          {navItem("Deleted Resources", "deleted", Trash, deletedCount)}
          {navItem("Events", "events", Calendar)}
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

      {/* Main Content */}
<div className="flex-1 h-full flex flex-col bg-bg">
  <div className="shrink-0 border-b border-border bg-bg shadow-sm">
    <div className="px-10 pt-8 pb-4">
      <h1 className="text-2xl font-semibold">
        {SECTION_TITLES[adminSection]}
      </h1>
    </div>
  </div>

{/* ✅ NEW: Controls */}
<AdminControls
  search={search}
  setSearch={setSearch}
  sortOrder={sortOrder}
  setSortOrder={setSortOrder}
/>

  <div className="flex-1 overflow-y-auto">
    <div className="px-10 pt-6 pb-10">
      {children}
    </div>
  </div>
</div>
    </div>
  );
} 