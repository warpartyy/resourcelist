import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  ResourceDiscoveryCandidate,
  ResourceDiscoveryResearchRequest,
  ResourceDiscoveryReviewStatus,
  ResourceDiscoverySavedSession,
  ResourceDiscoverySessionSummary,
} from "./types";

type ResourceDiscoverySessionRow = {
  id: string;
  created_at: string;
  created_by: string | null;
  parent_category: string;
  subcategory: string | null;
  state: string;
  county: string | null;
  city: string | null;
  search_scope: string;
  keywords: string | null;
  max_results: number;
  completed_at: string | null;
};

type ResourceDiscoveryCandidateRow = {
  id: string;
  session_id: string;
  organization: string;
  website: string;
  summary: string | null;
  evidence: unknown;
  field_confidence: unknown;
  discovered_fields: unknown;
  missing_fields: string[] | null;
  review_status: ResourceDiscoveryReviewStatus;
};

export async function saveResourceDiscoverySession({
  research,
  candidates,
  createdBy,
}: {
  research: ResourceDiscoveryResearchRequest;
  candidates: ResourceDiscoveryCandidate[];
  createdBy?: string | null;
}): Promise<ResourceDiscoverySavedSession> {
  const supabase = getSupabaseAdmin();
  const completedAt = new Date().toISOString();
  const { data: session, error: sessionError } = await supabase
    .from("resource_discovery_sessions" as never)
    .insert({
      created_by: createdBy ?? null,
      parent_category: research.parentCategory,
      subcategory: research.subcategory || null,
      state: research.state,
      county: research.county || null,
      city: research.city || null,
      search_scope: research.scope,
      keywords: research.keywords || null,
      max_results: research.maximumResults,
      completed_at: completedAt,
    } as never)
    .select("*")
    .single<ResourceDiscoverySessionRow>();

  if (sessionError) {
    throw sessionError;
  }

  const candidateRows = candidates.map((candidate) => ({
    session_id: session.id,
    organization: candidate.organization,
    website: candidate.website,
    summary: candidate.description ?? candidate.whySuggested ?? null,
    evidence: [],
    field_confidence: candidate.fieldConfidence ?? {},
    discovered_fields: toDiscoveredFields(candidate),
    missing_fields: [],
    review_status: "New" satisfies ResourceDiscoveryReviewStatus,
  }));

  if (candidateRows.length > 0) {
    const { data: savedCandidates, error: candidateError } = await supabase
      .from("resource_discovery_candidates" as never)
      .insert(candidateRows as never)
      .select("*")
      .returns<ResourceDiscoveryCandidateRow[]>();

    if (candidateError) {
      throw candidateError;
    }

    return {
      session: mapSessionRow(session),
      candidates: (savedCandidates ?? []).map(mapCandidateRow),
    };
  }

  return {
    session: mapSessionRow(session),
    candidates: [],
  };
}

export async function listRecentResourceDiscoverySessions(
  limit = 8,
): Promise<ResourceDiscoverySessionSummary[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("resource_discovery_sessions" as never)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<ResourceDiscoverySessionRow[]>();

  if (error) {
    if (isMissingResourceDiscoveryTableError(error)) {
      console.warn(
        "Resource Discovery history table is not available; returning empty recent research list.",
        error,
      );
      return [];
    }

    throw error;
  }

  return (data ?? []).map(mapSessionRow);
}

export async function getResourceDiscoverySession(
  sessionId: string,
): Promise<ResourceDiscoverySavedSession | null> {
  const supabase = getSupabaseAdmin();
  const { data: session, error: sessionError } = await supabase
    .from("resource_discovery_sessions" as never)
    .select("*")
    .eq("id" as never, sessionId as never)
    .maybeSingle<ResourceDiscoverySessionRow>();

  if (sessionError) {
    throw sessionError;
  }

  if (!session) {
    return null;
  }

  const { data: candidates, error: candidateError } = await supabase
    .from("resource_discovery_candidates" as never)
    .select("*")
    .eq("session_id" as never, sessionId as never)
    .order("created_at", { ascending: true })
    .returns<ResourceDiscoveryCandidateRow[]>();

  if (candidateError) {
    throw candidateError;
  }

  return {
    session: mapSessionRow(session),
    candidates: (candidates ?? []).map(mapCandidateRow),
  };
}

export async function updateResourceDiscoveryCandidateStatus({
  candidateId,
  status,
}: {
  candidateId: string;
  status: ResourceDiscoveryReviewStatus;
}): Promise<{ updated: boolean }> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("resource_discovery_candidates" as never)
    .update({ review_status: status } as never)
    .eq("id" as never, candidateId as never);

  if (error) {
    if (isMissingResourceDiscoveryTableError(error)) {
      console.warn(
        "Resource Discovery candidate history table is not available; pending resource was created without persisting candidate status.",
        error,
      );
      return { updated: false };
    }

    throw error;
  }

  return { updated: true };
}

function mapSessionRow(row: ResourceDiscoverySessionRow): ResourceDiscoverySessionSummary {
  return {
    id: row.id,
    createdAt: row.created_at,
    createdBy: row.created_by,
    parentCategory: row.parent_category,
    subcategory: row.subcategory,
    state: row.state,
    county: row.county,
    city: row.city,
    searchScope:
      row.search_scope === "Local" || row.search_scope === "Nearby"
        ? row.search_scope
        : "Statewide",
    keywords: row.keywords,
    maxResults: row.max_results,
    completedAt: row.completed_at,
  };
}

function mapCandidateRow(row: ResourceDiscoveryCandidateRow): ResourceDiscoveryCandidate {
  const discoveredFields = readRecord(row.discovered_fields);

  return {
    id: row.id,
    sessionId: row.session_id,
    organization: row.organization,
    website: row.website,
    phone: readString(discoveredFields.phone),
    email: readString(discoveredFields.email),
    address: readString(discoveredFields.address),
    city: readString(discoveredFields.city),
    state: readString(discoveredFields.state),
    zip: readString(discoveredFields.zip),
    description: row.summary ?? undefined,
    services: [],
    eligibility: readString(discoveredFields.eligibility),
    tribalEligibility: readString(discoveredFields.tribalEligibility),
    countiesServed: [],
    evidence: [],
    evidenceSources: Array.isArray(row.evidence) ? row.evidence as never : [],
    fieldConfidence: readRecord(row.field_confidence),
    missingFields: row.missing_fields ?? [],
    confidence: "Medium",
    whySuggested:
      readString(discoveredFields.whySuggested) ??
      row.summary ??
      "Evidence-backed candidate from saved research.",
    researchStatus: "Ready for Review" as never,
    reviewStatus: row.review_status,
    nextStep: "Admin Review",
  };
}

function toDiscoveredFields(candidate: ResourceDiscoveryCandidate) {
  return {
    description: candidate.description,
    whySuggested: candidate.whySuggested,
  };
}

function readRecord(value: unknown): Record<string, never> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, never>)
    : {};
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isMissingResourceDiscoveryTableError(error: { code?: string }) {
  return error.code === "PGRST205" || error.code === "42P01";
}
