import { NextRequest, NextResponse } from "next/server";
import {
  authorizeResourceGuideIntelligenceRequest,
  resourceGuideIntelligenceErrorResponse,
  unauthorizedResourceGuideIntelligenceResponse,
} from "@/app/api/admin/resource-guide/intelligence/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { discoverCandidateOrganizations } from "@/lib/services/admin/resource-discovery/discovery";
import { saveResourceDiscoverySession } from "@/lib/services/admin/resource-discovery/researchHistory";
import type {
  ResourceDiscoveryResearchInput,
} from "@/lib/services/admin/resource-discovery/types";

type CandidateDiscoveryRequestBody = Partial<ResourceDiscoveryResearchInput>;

export async function POST(req: NextRequest) {
  const authorization = await authorizeResourceGuideIntelligenceRequest(req);

  if (!authorization.authorized) {
    return unauthorizedResourceGuideIntelligenceResponse(authorization.status);
  }

  try {
    const body = (await req.json()) as CandidateDiscoveryRequestBody;
    const input = readDiscoveryInput(body);
    const createdBy = await getRequestUserId(req);
    const candidates = await discoverCandidateOrganizations(input);
    const savedSession = await saveResourceDiscoverySession({
      research: input,
      candidates,
      createdBy,
    });

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      session: savedSession.session,
      candidates: savedSession.candidates,
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Invalid")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return resourceGuideIntelligenceErrorResponse(error);
  }
}

async function getRequestUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  const supabase = getSupabaseAdmin();
  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  return user?.id ?? null;
}

function readDiscoveryInput(
  body: CandidateDiscoveryRequestBody,
): ResourceDiscoveryResearchInput {
  const parentCategory = readRequiredString(body.parentCategory, "parentCategory");
  const state = readRequiredString(body.state, "state");
  const maximumResults = readMaximumResults(body.maximumResults);

  return {
    parentCategory,
    subcategory: readOptionalString(body.subcategory),
    state,
    county: readOptionalString(body.county),
    city: readOptionalString(body.city),
    scope:
      body.scope === "Local" || body.scope === "Nearby" || body.scope === "Statewide"
        ? body.scope
        : "Statewide",
    keywords: readOptionalString(body.keywords),
    maximumResults,
  };
}

function readRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid ${fieldName}`);
  }

  return value.trim();
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readMaximumResults(value: unknown): number {
  const numeric = typeof value === "number" ? value : Number(value);

  if (Number.isNaN(numeric)) {
    return 5;
  }

  return Math.min(5, Math.max(1, Math.round(numeric)));
}
