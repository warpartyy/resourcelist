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
        className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition
          ${
            isActive
              ? "bg-blue-600 text-white"
              : "hover:bg-zinc-800 text-zinc-300"
          }`}
      >
        <Icon size={18} />

        {!collapsed && (
          <>
          <span className="flex-1 text-left">{label}</span>

            {count !== undefined && (
              <span className="text-xs bg-zinc-700 px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen flex bg-zinc-950 text-white">
      {/* Sidebar */}
      <div
        className={`${
          collapsed ? "w-20" : "w-64"
        } bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col transition-all duration-300`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {!collapsed && (
            <h2 className="text-lg font-semibold">Admin</h2>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-zinc-400 hover:text-white transition"
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
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-zinc-800 text-zinc-300 transition"
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-10 pt-10 pb-4 border-b border-zinc-800">
          <h1 className="text-2xl font-semibold">
            {SECTION_TITLES[adminSection]}
          </h1>
        </div>

        <div className="p-10">{children}</div>
      </div>
    </div>
  );
}
