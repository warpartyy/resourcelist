import { getSupabase } from "@/lib/supabase";
import { deriveParentCategories } from "./categoryService";

/**
 * Approve a submission → insert or update resource
 */

export async function approveResource(data: any) {
  const supabase = getSupabase(); // 👈 ADD THIS

  const slug = data.organization
    ?.toLowerCase()
    .replace(/\s+/g, "-");

  const derivedParents = deriveParentCategories(
    data.subcategories || []
  );

const resourcePayload = {
  organization: data.organization,
  slug,
  parent_categories: derivedParents,
  subcategories: data.subcategories || [],
  tags: data.tags || [],
  counties_served: data.counties_served || [],
  phone: data.phone || null,
  website: data.website || null,
  application_link: data.application_link || null,
  address: data.address || null,
  city: data.city || null,
  state: data.state || null,
  zip: data.zip || null,
  description: data.description || null,
  services: data.services || [],
  eligibility: data.eligibility || null,
  last_verified: new Date().toISOString().split("T")[0],
  source_submission_id: data.id,
};


  const { data: existing } = await supabase
    .from("resources")
    .select("id")
    .eq("source_submission_id", data.id)
    .maybeSingle();

  if (existing) {
    return await supabase
      .from("resources")
      .update(resourcePayload)
      .eq("id", existing.id);
  }

  return await supabase
    .from("resources")
    .insert([resourcePayload]);
}



/**
 * Update an existing approved resource
 */
function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function updateResource(id: string, data: any) {
  const supabase = getSupabase(); // 👈 add this

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





  // 2️⃣ Determine if organization changed
  let newSlug = existing.slug;

  if (existing.organization !== data.organization) {
    newSlug = generateSlug(data.organization);

    // 3️⃣ Check for slug conflict
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
      organization: data.organization,
      slug: newSlug,
      subcategories: data.subcategories || [],
      tags: data.tags || [],
      counties_served: data.counties_served || [],
      phone: data.phone || null,
      website: data.website || null,
      application_link: data.application_link || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      zip: data.zip || null,
      description: data.description || null,
      services: data.services || [],
      eligibility: data.eligibility || null,
      parent_categories: derivedParents,
      last_verified: new Date().toISOString().split("T")[0],
    })
    .eq("id", id)
    .select();

  console.log("Update result:", result);

  return result;
}




export async function deleteResource(id: string) {
  const supabase = getSupabase(); // 👈 add this
  return await supabase
    .from("resources")
    .delete()
    .eq("id", id);
}

