import { useAdminStore } from "@/lib/stores/adminStore";
import { getResourceStatusById } from "@/lib/services/comments/notificationService";

type RouterLike = {
  push: (href: string) => void;
};

type NavigateToAdminResourceArgs = {
  router: RouterLike;
  resourceId: string;
  commentId?: string | null;
};

export type AdminResourceTab = "resources" | "pending" | "rejected";

export type AdminResourceSubtab = "approved" | "pending" | "rejected";

export function mapResourceStatusToAdminSubtab(status: string): AdminResourceSubtab | null {
  if (status === "approved") return "approved";
  if (status === "pending") return "pending";
  if (status === "rejected") return "rejected";
  return null;
}

export async function navigateToAdminResource({
  router,
  resourceId,
  commentId,
}: NavigateToAdminResourceArgs) {
  const { data, error } = await getResourceStatusById(resourceId);

  if (error || !data?.status) {
    return { ok: false as const };
  }

  const subtab = mapResourceStatusToAdminSubtab(data.status);

  if (!subtab) {
    return { ok: false as const };
  }

  const { setAdminSection, setResourcesSubtab, setEditingId } = useAdminStore.getState();
  setAdminSection("resources");
  setResourcesSubtab(subtab);
  setEditingId(resourceId);

  const params = new URLSearchParams();
  params.set("tab", "resources");
  params.set("subtab", subtab);
  params.set("resource", resourceId);

  if (commentId) {
    params.set("comment", commentId);
  }

  router.push(`/admin?${params.toString()}`);

  return { ok: true as const, tab: "resources" as const, subtab };
}
