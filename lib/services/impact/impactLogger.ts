import type { Tables } from "@/lib/database.types";
import { getSupabase } from "@/lib/supabase";
import {
  IMPROVEMENT_KEYS,
  getImpactPoints,
} from "@/lib/services/impact/impactRules";
import type {
  ImprovementActivityKey,
  ImpactMetadata,
  ImpactSource,
  ImpactType,
} from "@/lib/services/impact/impactTypes";

type ResourceSnapshot = Pick<
  Tables<"resources">,
  | "phone"
  | "website"
  | "address"
  | "services"
  | "description"
  | "eligibility"
  | "counties_served"
  | "email"
  | "application_link"
  | "tags"
  | "subcategories"
  | "last_verified"
>;

type LogImpactArgs = {
  adminId: string;
  resourceId?: string | null;
  activityType: ImpactType;
  activityKey: string;
  metadata?: ImpactMetadata;
  source?: ImpactSource;
  preventDuplicate?: boolean;
};

const isBlank = (value: string | null | undefined) => !value || value.trim().length === 0;
const isEmptyArray = (value: string[] | null | undefined) => !Array.isArray(value) || value.length === 0;

function isMissing(snapshot: ResourceSnapshot, key: ImprovementActivityKey): boolean {
  if (key === "phone") return isBlank(snapshot.phone);
  if (key === "website") return isBlank(snapshot.website);
  if (key === "address") return isBlank(snapshot.address);
  if (key === "services") return isEmptyArray(snapshot.services);
  if (key === "description") return isBlank(snapshot.description);
  if (key === "eligibility") return isBlank(snapshot.eligibility);
  if (key === "counties") return isEmptyArray(snapshot.counties_served);
  if (key === "email") return isBlank(snapshot.email);
  if (key === "application_link") return isBlank(snapshot.application_link);
  if (key === "tags") return isEmptyArray(snapshot.tags);
  if (key === "subcategories") return isEmptyArray(snapshot.subcategories);
  return isBlank(snapshot.last_verified);
}

export async function logImpactActivity({
  adminId,
  resourceId,
  activityType,
  activityKey,
  metadata = {},
  source = "manual",
  preventDuplicate = false,
}: LogImpactArgs) {
  const supabase = getSupabase();

  if (preventDuplicate && resourceId) {
    const { data: existing, error: existingError } = await supabase
      .from("impact_log")
      .select("id")
      .eq("admin_id", adminId)
      .eq("resource_id", resourceId)
      .eq("activity_type", activityType)
      .eq("activity_key", activityKey)
      .maybeSingle();

    if (existingError) {
      console.error("Impact duplicate check failed", {
        message: existingError?.message,
        details: existingError?.details,
        hint: existingError?.hint,
        code: existingError?.code,
        error: existingError,
        context: {
          adminId,
          resourceId,
          activityType,
          activityKey,
          source,
        },
      });
      throw existingError;
    }

    if (existing) {
      return { logged: false as const, reason: "duplicate" as const };
    }
  }

  const points = getImpactPoints(activityType, activityKey);
  const payload = {
    admin_id: adminId,
    resource_id: resourceId ?? null,
    activity_type: activityType,
    activity_key: activityKey,
    source,
    points,
    metadata,
  };

  const { data, error } = await supabase
    .from("impact_log")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    console.error("Impact insert failed", {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
      error,
      payload,
    });
    throw error;
  }

  return { logged: true as const, id: data.id, points };
}

type LogResourceImprovementsArgs = {
  adminId: string;
  resourceId: string;
  before: ResourceSnapshot;
  after: ResourceSnapshot;
  source?: ImpactSource;
};

export async function logCompletedResourceImprovements({
  adminId,
  resourceId,
  before,
  after,
  source = "manual",
}: LogResourceImprovementsArgs) {
  const completedImprovements = IMPROVEMENT_KEYS.filter(
    (key) => isMissing(before, key) && !isMissing(after, key)
  );

  const results: Array<{
    key: ImprovementActivityKey;
    logged: boolean;
    points: number;
  }> = [];

  for (const key of completedImprovements) {
    const result = await logImpactActivity({
      adminId,
      resourceId,
      activityType: "resource_improved",
      activityKey: key,
      preventDuplicate: true,
      metadata: {
        improvement_key: key,
      },
      source,
    });

    results.push({
      key,
      logged: result.logged,
      points: result.logged ? result.points : 0,
    });
  }

  return results;
}
