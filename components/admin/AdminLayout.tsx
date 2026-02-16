"use client";

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
  | "rejected";

type Props = {
  adminSection: AdminSection;
  setAdminSection: (section: AdminSection) => void;
  onLogout: () => void;
  children: React.ReactNode;
};

export default function AdminLayout({
  adminSection,
  setAdminSection,
  onLogout,
  children,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const navItem = (
    label: string,
    value: AdminSection,
    Icon: any
  ) => {
    const isActive = adminSection === value;

    return (
      <button
        onClick={() => setAdminSection(value)}
        className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition
          ${isActive
            ? "bg-blue-600 text-white"
            : "hover:bg-zinc-800 text-zinc-300"}
        `}
      >
        <Icon size={18} />
        {!collapsed && <span>{label}</span>}
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
            <h2 className="text-lg font-semibold">
              Admin
            </h2>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-zinc-400 hover:text-white transition"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* WORKFLOW */}
        {!collapsed && (
          <div className="text-xs uppercase text-zinc-500 mb-3">
            Workflow
          </div>
        )}

        <div className="space-y-2 mb-6">
          {navItem("Pending Suggestions", "pending", Clock)}
          {navItem("Active Resources", "resources", Database)}
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800 my-4" />

        {/* HISTORY */}
        {!collapsed && (
          <div className="text-xs uppercase text-zinc-500 mb-3">
            History
          </div>
        )}

        <div className="space-y-2">
          {navItem("Approval History", "approved", CheckCircle)}
          {navItem("Rejected", "rejected", XCircle)}
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
      <div className="flex-1 p-10 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
