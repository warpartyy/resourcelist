import { fetchApprovedResources } from "@/lib/services/resources/approvedResourcesProvider";
import SearchLabAdminShell from "./components/SearchLabAdminShell";

export default async function AdminSearchLabPage() {
  const resources = await fetchApprovedResources();

  return <SearchLabAdminShell resources={resources} />;
}
