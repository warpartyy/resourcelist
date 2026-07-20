import { getSupabase } from "@/lib/supabase";
import {
  getImpactRule,
} from "@/lib/services/impact/impactRules";
import type {
  CommunityImpactSummary,
  DashboardImpactSummary,
  DirectoryMetrics,
  ImprovementActivityKey,
  RecentImpactItem,
  ImpactType,
} from "@/lib/services/impact/impactTypes";

function getWeekBounds(now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

function toArray(value: string[] | null | undefined) {
  return Array.isArray(value) ? value : [];
}

const COMPLETENESS_KEYS: ImprovementActivityKey[] = [
  "phone",
  "website",
  "address",
  "services",
  "description",
  "eligibility",
  "counties",
  "email",
  "application_link",
  "tags",
  "subcategories",
  "last_verified",
];

function isCompleteForKey(
  resource: {
    phone: string | null;
    website: string | null;
    address: string | null;
    services: string[] | null;
    description: string | null;
    eligibility: string | null;
    counties_served: string[] | null;
    email: string | null;
    application_link: string | null;
    tags: string[] | null;
    subcategories: string[] | null;
    last_verified: string | null;
  },
  key: ImprovementActivityKey
) {
  if (key === "phone") return Boolean(resource.phone && resource.phone.trim());
  if (key === "website") return Boolean(resource.website && resource.website.trim());
  if (key === "address") return Boolean(resource.address && resource.address.trim());
  if (key === "services") return toArray(resource.services).length > 0;
  if (key === "description") return Boolean(resource.description && resource.description.trim());
  if (key === "eligibility") return Boolean(resource.eligibility && resource.eligibility.trim());
  if (key === "counties") return toArray(resource.counties_served).length > 0;
  if (key === "email") return Boolean(resource.email && resource.email.trim());
  if (key === "application_link") return Boolean(resource.application_link && resource.application_link.trim());
  if (key === "tags") return toArray(resource.tags).length > 0;
  if (key === "subcategories") return toArray(resource.subcategories).length > 0;
  return Boolean(resource.last_verified && resource.last_verified.trim());
}

async function fetchActivityRows(where?: { adminId?: string; limit?: number; startIso?: string; endIso?: string }) {
  const supabase = getSupabase();

  let query = supabase
    .from("impact_log")
    .select("id, admin_id, resource_id, activity_type, activity_key, points, source, created_at")
    .order("created_at", { ascending: false });

  if (where?.adminId) {
    query = query.eq("admin_id", where.adminId);
  }

  if (where?.startIso) {
    query = query.gte("created_at", where.startIso);
  }

  if (where?.endIso) {
    query = query.lt("created_at", where.endIso);
  }

  if (typeof where?.limit === "number") {
    query = query.limit(where.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      error,
    });
    throw error;
  }

  return data || [];
}

async function toFeedItems(rows: Array<{
  id: string;
  resource_id: string | null;
  activity_type: string;
  activity_key: string;
  points: number;
  source: string | null;
  created_at: string;
}>) {
  const supabase = getSupabase();
  const resourceIds = rows
    .map((row) => row.resource_id)
    .filter((id): id is string => Boolean(id));

  const uniqueIds = Array.from(new Set(resourceIds));

  const resourceMap = new Map<string, string>();

  if (uniqueIds.length > 0) {
    const { data: resources, error } = await supabase
      .from("resources")
      .select("id, organization")
      .in("id", uniqueIds);

    if (error) {
      console.error("Supabase error", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        error,
      });
      throw error;
    }

    (resources || []).forEach((resource) => {
      resourceMap.set(resource.id, resource.organization || "Unknown Resource");
    });
  }

  return rows.map((row) => ({
    id: row.id,
    title:
      getImpactRule(row.activity_type as ImpactType, row.activity_key)?.title ||
      "Impact Activity",
    description:
      getImpactRule(row.activity_type as ImpactType, row.activity_key)?.description ||
      "An admin contributed to directory quality.",
    organization: row.resource_id ? resourceMap.get(row.resource_id) || "Unknown Resource" : "System",
    points: row.points,
    createdAt: row.created_at,
    source: row.source,
  }));
}

export async function getWeeklyImpact(adminId: string) {
  const rows = await fetchActivityRows({ adminId, ...getWeekBounds() });

  return rows.reduce((sum, row) => sum + (row.points || 0), 0);
}

export async function getMyImpact(adminId: string): Promise<DashboardImpactSummary> {
  const rows = await fetchActivityRows({ adminId });
  const impactPoints = rows.reduce((sum, row) => sum + (row.points || 0), 0);
  const thisWeek = await getWeeklyImpact(adminId);

  return {
    impactPoints,
    totalContributions: rows.length,
    thisWeek,
  };
}

export async function getDirectoryMetrics(): Promise<DirectoryMetrics> {
  const supabase = getSupabase();

  const [
    { data: approvedRows, error: approvedRowsError },
    { count: duplicateMergedCount, error: duplicateMergedCountError },
  ] = await Promise.all([
    supabase
      .from("resources")
      .select(
        "id, phone, website, address, services, description, eligibility, counties_served, email, application_link, tags, subcategories, last_verified"
      )
      .eq("status", "approved"),
    supabase
      .from("impact_log")
      .select("id", { count: "exact", head: true })
      .eq("activity_type", "duplicate_merged"),
  ]);

  if (approvedRowsError) {
    console.error("Supabase error", {
      message: approvedRowsError.message,
      details: approvedRowsError.details,
      hint: approvedRowsError.hint,
      code: approvedRowsError.code,
      error: approvedRowsError,
    });
    throw approvedRowsError;
  }

  if (duplicateMergedCountError) {
    console.error("Supabase error", {
      message: duplicateMergedCountError.message,
      details: duplicateMergedCountError.details,
      hint: duplicateMergedCountError.hint,
      code: duplicateMergedCountError.code,
      error: duplicateMergedCountError,
    });
    throw duplicateMergedCountError;
  }

  const resources = approvedRows || [];
  const resourceIds = resources.map((resource) => resource.id);

  const { data: overrideRows, error: overrideRowsError } =
    resourceIds.length === 0
      ? { data: [], error: null }
      : await supabase
          .from("resource_improvement_overrides")
          .select("resource_id, improvement_key")
          .eq("status", "not_applicable")
          .in("resource_id", resourceIds);

  if (overrideRowsError) {
    console.error("Supabase error", {
      message: overrideRowsError.message,
      details: overrideRowsError.details,
      hint: overrideRowsError.hint,
      code: overrideRowsError.code,
      error: overrideRowsError,
    });
    throw overrideRowsError;
  }

  const overrideSet = new Set(
    (overrideRows || []).map((row) => `${row.resource_id}-${row.improvement_key}`)
  );

  const isOverridden = (resourceId: string, key: ImprovementActivityKey) =>
    overrideSet.has(`${resourceId}-${key}`);

  const approvedResources = resources.length;
  const verifiedResources = resources.filter((row) => row.last_verified && row.last_verified.trim()).length;
  const resourcesMissingPhone = resources.filter((row) => !isOverridden(row.id, "phone") && (!row.phone || !row.phone.trim())).length;
  const resourcesMissingWebsite = resources.filter((row) => !isOverridden(row.id, "website") && (!row.website || !row.website.trim())).length;
  const resourcesMissingDescription = resources.filter((row) => !isOverridden(row.id, "description") && (!row.description || !row.description.trim())).length;
  const resourcesMissingServices = resources.filter((row) => !isOverridden(row.id, "services") && toArray(row.services).length === 0).length;

  let totalChecks = 0;
  let completeChecks = 0;

  for (const row of resources) {
    for (const key of COMPLETENESS_KEYS) {
      if (isOverridden(row.id, key)) {
        continue;
      }

      totalChecks += 1;
      if (isCompleteForKey(row, key)) {
        completeChecks += 1;
      }
    }
  }

  const completeness = totalChecks === 0 ? 0 : Math.round((completeChecks / totalChecks) * 100);

  return {
    approvedResources,
    verifiedResources,
    resourcesMissingPhone,
    resourcesMissingWebsite,
    resourcesMissingDescription,
    resourcesMissingServices,
    duplicateResourcesMerged: duplicateMergedCount || 0,
    completeness,
  };
}

export async function getCommunityImpact(): Promise<CommunityImpactSummary> {
  const rows = await fetchActivityRows();
  const totalImpactPoints = rows.reduce((sum, row) => sum + (row.points || 0), 0);
  const totalImprovements = rows.filter((row) => row.activity_type === "resource_improved").length;
  const activeAdmins = new Set(rows.map((row) => row.admin_id)).size;
  const directoryMetrics = await getDirectoryMetrics();

  return {
    totalImpactPoints,
    totalImprovements,
    activeAdmins,
    directoryCompleteness: directoryMetrics.completeness,
  };
}

export async function getRecentActivity(limit: number) {
  const rows = await fetchActivityRows({ limit });
  return (await toFeedItems(rows)) as RecentImpactItem[];
}

export async function getMyRecentActivity(adminId: string) {
  const rows = await fetchActivityRows({ adminId, limit: 10 });
  return (await toFeedItems(rows)) as RecentImpactItem[];
}
