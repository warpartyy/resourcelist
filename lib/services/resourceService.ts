import { getSupabase } from "@/lib/supabase";
import { deriveParentCategories } from "./categoryService";


function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Update an existing approved resource
 */

export async function updateResource(id: string, data: any) {
  const supabase = getSupabase();

  console.log("Updating resource with ID:", id);

  // 1️⃣ Get existing resource
  const { data: existing, error: fetchError } = await supabase
    .from("resources")
    .select("organization, slug")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return { error: fetchError || new Error("Resource not found") };
  }

  // ✅ SAFE organization fallback
  const orgName = data.organization ?? existing.organization;

  let newSlug = existing.slug;

  if (existing.organization !== orgName) {
    newSlug = generateSlug(orgName);

    const { data: slugConflict } = await supabase
      .from("resources")
      .select("id")
      .eq("slug", newSlug)
      .neq("id", id)
      .maybeSingle();

    if (slugConflict) {
      newSlug = `${newSlug}-${Date.now()}`;
    }
  }

  const derivedParents = deriveParentCategories(
    data.subcategories || []
  );

  // 4️⃣ Update resource
  const result = await supabase
    .from("resources")
    .update({
      organization: orgName,
      slug: newSlug,

      status: data.status ?? undefined,

      subcategories: data.subcategories ?? [],
      tags: data.tags ?? [],
      counties_served: data.counties_served ?? [],
      phone: data.phone ?? null,
      email: data.email ?? null,
      website: data.website ?? null,
      application_link: data.application_link ?? null,
      address: data.address ?? null,
      city: data.city ?? null,
      state: data.state ?? null,
      zip: data.zip ?? null,
      description: data.description ?? null,
      services: data.services ?? [],
      eligibility: data.eligibility ?? null,
      parent_categories: derivedParents,

      admin_notes: data.admin_notes ?? null,
      last_edited_by: data.last_edited_by ?? null,
      last_edited_email: data.last_edited_email ?? null,
      last_edited_at: data.last_edited_at ?? null,

      last_verified: new Date().toISOString().split("T")[0],
    })
    .eq("id", id)
    .select();

  console.log("Update result:", result);

  return result;
}


export async function softDeleteResource(id: string) {
  const supabase = getSupabase();
  return await supabase
    .from("resources")
    .update({ status: "deleted" })
    .eq("id", id);
}

export async function restoreResource(id: string) {
  const supabase = getSupabase();
  return await supabase
    .from("resources")
    .update({ status: "approved" })
    .eq("id", id);
}

export async function hardDeleteResource(id: string) {
  const supabase = getSupabase();
  return await supabase
    .from("resources")
    .delete()
    .eq("id", id);
}

export async function getResourcesByStatus(status: string) {
  const supabase = getSupabase();

  return await supabase
    .from("resources")
    .select("*")
    .eq("status", status)
    .order("id", { ascending: false });
}

export async function approveResource(id: string) {
  const supabase = getSupabase();

  return await supabase
    .from("resources")
    .update({ status: "approved" })
    .eq("id", id);
}

export async function rejectResource(id: string) {
  const supabase = getSupabase();

  return await supabase
    .from("resources")
    .update({ status: "rejected" })
    .eq("id", id);
}

export async function moveResourceToPending(id: string) {
  const supabase = getSupabase();

  return await supabase
    .from("resources")
    .update({ status: "pending" })
    .eq("id", id);
}