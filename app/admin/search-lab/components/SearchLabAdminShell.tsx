"use client";

import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { getSupabase } from "@/lib/supabase";
import type { AdminSection } from "@/lib/stores/adminStore";
import type { ResourceRow } from "@/lib/services/resources/intelligence/types";
import SearchLabPanel from "./SearchLabPanel";

export default function SearchLabAdminShell({
  resources,
}: {
  resources: ResourceRow[];
}) {
  const router = useRouter();

  const handleSectionChange = (section: AdminSection) => {
    if (section === "search-lab") {
      router.push("/admin/search-lab");
      return;
    }

    router.push(`/admin?tab=${section}`);
  };

  const handleLogout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <AdminLayout
      adminSection="search-lab"
      setAdminSection={handleSectionChange}
      onLogout={handleLogout}
    >
      <SearchLabPanel resources={resources} />
    </AdminLayout>
  );
}
