import type { Database } from "@/lib/database.types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type ResourceInsert = Database["public"]["Tables"]["resources"]["Insert"];
type ResourceRow = Database["public"]["Tables"]["resources"]["Row"];

export type CreatePendingResourceFromDiscoveryInput = {
  organization: string;
  website: string;
};

export type PendingDiscoveryResource = Pick<
  ResourceRow,
  "id" | "organization" | "slug" | "status" | "website"
>;

export async function createPendingResourceFromDiscovery({
  organization,
  website,
}: CreatePendingResourceFromDiscoveryInput): Promise<PendingDiscoveryResource> {
  const supabase = getSupabaseAdmin();
  const normalizedOrganization = organization.trim();
  const normalizedWebsite = website.trim();

  if (!normalizedOrganization) {
    throw new Error("Invalid organization");
  }

  if (!normalizedWebsite) {
    throw new Error("Invalid website");
  }

  const slug = await createUniqueResourceSlug(normalizedOrganization);
  const insertPayload: ResourceInsert = {
    organization: normalizedOrganization,
    slug,
    status: "pending",
    website: normalizedWebsite,
  };

  const { data, error } = await supabase
    .from("resources")
    .insert(insertPayload)
    .select("id, organization, slug, status, website")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function createUniqueResourceSlug(organization: string) {
  const supabase = getSupabaseAdmin();
  const baseSlug = generateResourceSlug(organization) || "resource";
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase
      .from("resources")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

function generateResourceSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
