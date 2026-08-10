import { getSupabase } from "@/lib/supabase";
import { deriveParentCategories } from "./categoryService";
import { Database } from "@/lib/database.types";
import {
  logCompletedResourceImprovements,
  logImpactActivity,
} from "@/lib/services/impact/impactLogger";
import { getImprovementDisplayLabel } from "@/lib/services/impact/impactRules";
import type { ImprovementActivityKey } from "@/lib/services/impact/impactTypes";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ==============================
// Resource Update Type
// ==============================

type ResourceUpdate =
  Database["public"]["Tables"]["resources"]["Update"];

type UpdateResourceImpact = {
  points: number;
  improvements: string[];
};

export type UpdateResourceResult = {
  data?: unknown;
  error: unknown;
  impact?: UpdateResourceImpact;
};

/**
 * Update an existing approved resource
 */

export async function updateResource(
  id: string,
  data: ResourceUpdate,
  actorAdminId?: string | null
): Promise<UpdateResourceResult> {
  const supabase = getSupabase();

  console.log("Updating resource with ID:", id);

  // 1️⃣ Get existing resource
  const { data: existing, error: fetchError } = await supabase
    .from("resources")
    .select(`
  organization,
  slug,
  status,
    rejected_at,
  subcategories,
  tags,
  counties_served,
  phone,
  email,
  website,
  application_link,
  address,
  city,
  state,
  zip,
  description,
  services,
  eligibility,
  is_tribal,
  tribe,
  tribal_eligibility,
  last_verified,
  last_edited_by,
  last_edited_email,
  last_edited_name,
  last_edited_at
`)
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return { error: fetchError || new Error("Resource not found") };
  }
  
  const orgName = data.organization ?? existing.organization ?? "";

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

const subcats = data.subcategories ?? existing.subcategories ?? [];

const derivedParents = deriveParentCategories(subcats);

  const now = new Date().toISOString();

const shouldUpdateVerification =
  data.status === "approved" || existing.status === "approved";

const nextStatus = data.status ?? existing.status;
const movedToRejected = existing.status !== "rejected" && nextStatus === "rejected";
const movedOffRejected = existing.status === "rejected" && nextStatus !== "rejected";

  // ✅ Build update payload safely
const updatePayload: ResourceUpdate = {
  organization: orgName,
  slug: newSlug,
  

  status: data.status ?? existing.status,
  rejected_at:
    movedToRejected
      ? now
      : movedOffRejected
      ? null
      : data.rejected_at ?? existing.rejected_at ?? null,

  subcategories: subcats,
  parent_categories: derivedParents,
  tags: data.tags ?? existing.tags ?? [],
  counties_served: data.counties_served ?? existing.counties_served ?? [],
  phone: data.phone ?? existing.phone ?? null,
  email: data.email ?? existing.email ?? null,
  website: data.website ?? existing.website ?? null,
  application_link: data.application_link ?? existing.application_link ?? null,
  address: data.address ?? existing.address ?? null,
  city: data.city ?? existing.city ?? null,
  state: data.state ?? existing.state ?? null,
  zip: data.zip ?? existing.zip ?? null,
  description: data.description ?? existing.description ?? null,
  services: data.services ?? existing.services ?? [],
  eligibility: data.eligibility ?? existing.eligibility ?? null,
  is_tribal: data.is_tribal ?? existing.is_tribal ?? false,
  tribe: data.tribe ?? existing.tribe ?? null,
  tribal_eligibility: data.tribal_eligibility ?? existing.tribal_eligibility ?? null,
  last_edited_by: data.last_edited_by ?? existing.last_edited_by ?? null,
  last_edited_email: data.last_edited_email ?? existing.last_edited_email ?? null,
  last_edited_at: now,
  last_edited_name: data.last_edited_name ?? existing.last_edited_name ?? null,
};

// ✅ Only set verification when appropriate
if (shouldUpdateVerification) {
  updatePayload.last_verified = now;
}

  // 4️⃣ Update resource
const result = await supabase
  .from("resources")
  .update(updatePayload)
  .eq("id", id)
  .select();

  let impact: UpdateResourceImpact | undefined;
  const impactAdminId =
    actorAdminId ??
    (typeof data.last_edited_by === "string" ? data.last_edited_by : null) ??
    existing.last_edited_by ??
    null;

  if (!result.error && impactAdminId) {

    try {
      const adminId = impactAdminId;

      if (existing.status !== "approved" && nextStatus === "approved") {
        await logImpactActivity({
          adminId,
          resourceId: id,
          activityType: "resource_approved",
          activityKey: "approved",
          source: "manual",
          metadata: {
            from_status: existing.status,
            to_status: nextStatus,
          },
        });
      }

      const beforeVerified = existing.last_verified ?? null;
      const afterVerified = updatePayload.last_verified ?? existing.last_verified ?? null;

      if (!beforeVerified && afterVerified) {
        await logImpactActivity({
          adminId,
          resourceId: id,
          activityType: "resource_verified",
          activityKey: "verified",
          source: "manual",
          metadata: {
            verified_at: afterVerified,
          },
        });
      }

      const completed = await logCompletedResourceImprovements({
        adminId,
        resourceId: id,
        source: "manual",
        before: {
          phone: existing.phone,
          website: existing.website,
          address: existing.address,
          services: existing.services,
          description: existing.description,
          eligibility: existing.eligibility,
          counties_served: existing.counties_served,
          email: existing.email,
          application_link: existing.application_link,
          tags: existing.tags,
          subcategories: existing.subcategories,
          last_verified: existing.last_verified,
        },
        after: {
          phone: updatePayload.phone ?? null,
          website: updatePayload.website ?? null,
          address: updatePayload.address ?? null,
          services: updatePayload.services ?? [],
          description: updatePayload.description ?? null,
          eligibility: updatePayload.eligibility ?? null,
          counties_served: updatePayload.counties_served ?? [],
          email: updatePayload.email ?? null,
          application_link: updatePayload.application_link ?? null,
          tags: updatePayload.tags ?? [],
          subcategories: updatePayload.subcategories ?? [],
          last_verified: updatePayload.last_verified ?? existing.last_verified ?? null,
        },
      });

      const loggedImprovements = (completed || []).filter((item) => item.logged);

      if (loggedImprovements.length > 0) {
        const points = loggedImprovements.reduce((sum, item) => sum + item.points, 0);
        const improvements = loggedImprovements.map((item) =>
          getImprovementDisplayLabel(item.key as ImprovementActivityKey)
        );

        impact = {
          points,
          improvements,
        };
      }
    } catch (impactError) {
      const supabaseError =
        impactError && typeof impactError === "object" ? impactError : null;

      console.error("Failed to log impact", {
        message: supabaseError && "message" in supabaseError ? supabaseError.message : undefined,
        details: supabaseError && "details" in supabaseError ? supabaseError.details : undefined,
        hint: supabaseError && "hint" in supabaseError ? supabaseError.hint : undefined,
        code: supabaseError && "code" in supabaseError ? supabaseError.code : undefined,
        error: impactError,
        context: {
          resourceId: id,
          adminId: impactAdminId,
          fromStatus: existing.status,
          toStatus: nextStatus,
        },
      });
    }
  }

  return {
    ...result,
    impact,
  };
}



export async function restoreResource(
  id: string,
  audit: {
    last_edited_by: string;
    last_edited_email: string;
    last_edited_name: string;
  }
) {
  const supabase = getSupabase();
  return await supabase
    .from("resources")
    .update({
  status: "pending",
  rejected_at: null,
  last_edited_by: audit.last_edited_by,
  last_edited_email: audit.last_edited_email,
  last_edited_name: audit.last_edited_name,
  last_edited_at: new Date().toISOString(),
})
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
  const now = new Date().toISOString();

  return await supabase
    .from("resources")
    .update({
      status: "approved",
      rejected_at: null,
      last_verified: now,
      last_edited_at: now,
    })
    .eq("id", id);
}

export async function rejectResource(id: string) {
  const supabase = getSupabase();
  const now = new Date().toISOString();

  return await supabase
    .from("resources")
    .update({
      status: "rejected",
      rejected_at: now,
      last_edited_at: now,
    })
    .eq("id", id);
}

export async function moveResourceToPending(
  id: string,
  audit: {
    last_edited_by: string;
    last_edited_email: string;
    last_edited_name: string;
  }
) {
  const supabase = getSupabase();

  return await supabase
    .from("resources")
    .update({
      status: "pending",
      rejected_at: null,
      last_edited_by: audit.last_edited_by,
      last_edited_email: audit.last_edited_email,
      last_edited_name: audit.last_edited_name,
      last_edited_at: new Date().toISOString(),
    })
    .eq("id", id);
}
 