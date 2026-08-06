import { create } from "zustand";

export type AdminSection =
  | "dashboard"
  | "resources"
  | "quality"
  | "update-requests"
  | "settings"
  | "events"
  | "messages"
  | "notifications"
  | "improvements"
  | "search-lab";

export type ResourcesSubtab = "pending" | "approved" | "rejected";
export type QualitySubtab = "improvements";
export type MessagesSubtab = "community" | "admin-team";

export type SortOrder =
  | "az"
  | "za"
  | "newest"
  | "oldest";

interface AdminStore {
  adminSection: AdminSection;
  resourcesSubtab: ResourcesSubtab;
  qualitySubtab: QualitySubtab;
  messagesSubtab: MessagesSubtab;
  search: string;
  sortOrder: SortOrder;
  editingId: string | null;

  setAdminSection: (section: AdminSection) => void;
  setResourcesSubtab: (tab: ResourcesSubtab) => void;
  setQualitySubtab: (tab: QualitySubtab) => void;
  setMessagesSubtab: (tab: MessagesSubtab) => void;
  setSearch: (search: string) => void;
  setSortOrder: (order: SortOrder) => void;
  setEditingId: (id: string | null) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  adminSection: "dashboard",
  resourcesSubtab: "pending",
  qualitySubtab: "improvements",
  messagesSubtab: "community",
  search: "",
  sortOrder: "newest",
  editingId: null,

  setAdminSection: (adminSection) =>
    set({ adminSection }),

  setResourcesSubtab: (resourcesSubtab) =>
    set({ resourcesSubtab }),

  setQualitySubtab: (qualitySubtab) =>
    set({ qualitySubtab }),

  setMessagesSubtab: (messagesSubtab) =>
    set({ messagesSubtab }),

  setSearch: (search) =>
    set({ search }),

  setSortOrder: (sortOrder) =>
    set({ sortOrder }),

  setEditingId: (editingId) =>
    set({ editingId }),
}));
