"use client";
import { Trash } from "lucide-react";
import { useState } from "react";
import {
  Clock,
  Database,
  CheckCircle,
  XCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type AdminSection =
  | "pending"
  | "resources"
  | "approved"
  | "rejected"
  | "deleted";

const SECTION_TITLES: Record<AdminSection, string> = {
  pending: "Pending Suggestions",
  resources: "Active Resources",
  approved: "Approval History",
  rejected: "Rejected Submissions",
  deleted: "Deleted Resources",
};

type Props = {
  adminSection: AdminSection;
  setAdminSection: (section: AdminSection) => void;
  onLogout: () => void;
  pendingCount?: number;
  resourceCount?: number;
  approvedCount?: number;
  rejectedCount?: number;
  deletedCount?: number;   // ✅ add this
  children: React.ReactNode;
};

export default function AdminLayout({
  adminSection,
  setAdminSection,
  onLogout,
  pendingCount,
  resourceCount,
  approvedCount,
  rejectedCount,
  deletedCount,
  children,
}: Props) {

  const [collapsed, setCollapsed] = useState(false);

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
    <div className="min-h-screen flex bg-bg text-text-primary">
      {/* Sidebar */}
      <div
        className={`${
          collapsed ? "w-20" : "w-64"
        } bg-surface border-r border-border p-4 flex flex-col transition-all duration-300`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {!collapsed && (
            <h2 className="text-lg font-semibold">Admin</h2>
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
          {navItem("Active Resources", "resources", Database, resourceCount)}
          {navItem("Approval History", "approved", CheckCircle, approvedCount)}
          {navItem("Rejected", "rejected", XCircle, rejectedCount)}
          {navItem("Deleted Resources", "deleted", Trash, deletedCount)}

        </div>

        {/* Logout */}
        <div className="mt-auto border-t border-zinc-800 pt-4">
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
      <div className="flex-1 overflow-y-auto">
        <div className="px-10 pt-10 pb-4 border-b border-border">
          <h1 className="text-2xl font-semibold">
            {SECTION_TITLES[adminSection]}
          </h1>
        </div>

        <div className="p-10">{children}</div>
      </div>
    </div>
  );
}