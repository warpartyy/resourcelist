import { create } from "zustand";

export type AdminSection =
  | "pending"
  | "update-requests"
  | "rejected"
  | "resources"
  | "settings"
  | "events"
  | "messages"
  | "notifications";

export type SortOrder =
  | "az"
  | "za"
  | "newest"
  | "oldest";

interface AdminStore {
  adminSection: AdminSection;
  search: string;
  sortOrder: SortOrder;
  editingId: string | null;

  setAdminSection: (section: AdminSection) => void;
  setSearch: (search: string) => void;
  setSortOrder: (order: SortOrder) => void;
  setEditingId: (id: string | null) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  adminSection: "pending",
  search: "",
  sortOrder: "newest",
  editingId: null,

  setAdminSection: (adminSection) =>
    set({ adminSection }),

  setSearch: (search) =>
    set({ search }),

  setSortOrder: (sortOrder) =>
    set({ sortOrder }),

  setEditingId: (editingId) =>
    set({ editingId }),
}));