import type { OrganizationCandidate } from "./candidate";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ResourceDiscoveryCandidate } from "../types";

export type OrganizationDuplicateSignal =
  | "exact_organization_name"
  | "website"
  | "phone"
  | "address"
  | "alias"
  | "fuzzy_organization_match";

export type OrganizationDuplicateCheck = {
  candidate: OrganizationCandidate;
  signals: OrganizationDuplicateSignal[];
  duplicateConfidence: number;
  alreadyInDirectory: boolean;
};

export function checkOrganizationDuplicate(
  candidate: OrganizationCandidate,
): OrganizationDuplicateCheck {
  return {
    candidate,
    signals: [],
    duplicateConfidence: candidate.duplicateConfidence,
    alreadyInDirectory: candidate.alreadyInDirectory,
  };
}

export function dedupeOrganizationCandidates(
  candidates: OrganizationCandidate[],
): OrganizationCandidate[] {
  const seen = new Set<string>();

  return candidates.filter((candidate) => {
    const key = [
      candidate.organization.toLowerCase().trim(),
      candidate.website?.toLowerCase().trim(),
    ]
      .filter(Boolean)
      .join("|");

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export async function filterExistingResourceCandidates(
  candidates: ResourceDiscoveryCandidate[],
): Promise<ResourceDiscoveryCandidate[]> {
  if (candidates.length === 0) {
    return [];
  }

  const existing = await loadExistingResourceDuplicateFields();

  return candidates
    .map((candidate) => {
      const duplicate = findResourceDuplicate(candidate, existing);

      return {
        ...candidate,
        alreadyInDirectory: duplicate.alreadyInDirectory,
        duplicateConfidence: duplicate.duplicateConfidence,
      };
    })
    .filter((candidate) => !candidate.alreadyInDirectory);
}

type ExistingResourceDuplicateFields = {
  organization: string | null;
  website: string | null;
  phone: string | null;
  address: string | null;
};

async function loadExistingResourceDuplicateFields(): Promise<
  ExistingResourceDuplicateFields[]
> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("resources")
    .select("organization, website, phone, address");

  if (error) {
    throw error;
  }

  return data ?? [];
}

function findResourceDuplicate(
  candidate: ResourceDiscoveryCandidate,
  existing: ExistingResourceDuplicateFields[],
) {
  for (const resource of existing) {
    const signals: OrganizationDuplicateSignal[] = [];

    if (sameText(candidate.organization, resource.organization)) {
      signals.push("exact_organization_name");
    }

    if (sameWebsite(candidate.website, resource.website)) {
      signals.push("website");
    }

    if (samePhone(candidate.phone, resource.phone)) {
      signals.push("phone");
    }

    if (sameText(candidate.address, resource.address)) {
      signals.push("address");
    }

    if (signals.length > 0) {
      return {
        signals,
        duplicateConfidence: getDuplicateConfidence(signals),
        alreadyInDirectory: true,
      };
    }
  }

  return {
    signals: [],
    duplicateConfidence: 0,
    alreadyInDirectory: false,
  };
}

function getDuplicateConfidence(signals: OrganizationDuplicateSignal[]) {
  if (signals.includes("website")) return 100;
  if (signals.includes("exact_organization_name")) return 95;
  if (signals.includes("phone")) return 90;
  if (signals.includes("address")) return 80;
  return 0;
}

function sameText(left?: string | null, right?: string | null) {
  const normalizedLeft = normalizeText(left);
  const normalizedRight = normalizeText(right);

  return Boolean(normalizedLeft && normalizedLeft === normalizedRight);
}

function sameWebsite(left?: string | null, right?: string | null) {
  const normalizedLeft = normalizeWebsite(left);
  const normalizedRight = normalizeWebsite(right);

  return Boolean(normalizedLeft && normalizedLeft === normalizedRight);
}

function samePhone(left?: string | null, right?: string | null) {
  const normalizedLeft = left?.replace(/\D/g, "") ?? "";
  const normalizedRight = right?.replace(/\D/g, "") ?? "";

  return Boolean(
    normalizedLeft &&
      normalizedRight &&
      normalizedLeft.slice(-10) === normalizedRight.slice(-10),
  );
}

function normalizeText(value?: string | null) {
  return value?.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
}

function normalizeWebsite(value?: string | null) {
  if (!value?.trim()) {
    return "";
  }

  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    return url.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return value.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}
