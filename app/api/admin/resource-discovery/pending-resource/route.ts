import { NextRequest, NextResponse } from "next/server";
import {
  authorizeResourceGuideIntelligenceRequest,
  resourceGuideIntelligenceErrorResponse,
  unauthorizedResourceGuideIntelligenceResponse,
} from "@/app/api/admin/resource-guide/intelligence/auth";
import { createPendingResourceFromDiscovery } from "@/lib/services/admin/resource-discovery/pendingResource";
import { updateResourceDiscoveryCandidateStatus } from "@/lib/services/admin/resource-discovery/researchHistory";

type CreatePendingResourceRequestBody = {
  candidateId?: unknown;
  organization?: unknown;
  website?: unknown;
};

export async function POST(req: NextRequest) {
  const authorization = await authorizeResourceGuideIntelligenceRequest(req);

  if (!authorization.authorized) {
    return unauthorizedResourceGuideIntelligenceResponse(authorization.status);
  }

  try {
    const body = (await req.json()) as CreatePendingResourceRequestBody;
    const organization = readRequiredString(body.organization, "organization");
    const website = readRequiredString(body.website, "website");
    const candidateId = readOptionalString(body.candidateId);
    const resource = await createPendingResourceFromDiscovery({
      organization,
      website,
    });

    if (candidateId) {
      try {
        await updateResourceDiscoveryCandidateStatus({
          candidateId,
          status: "Created",
        });
      } catch (statusError) {
        console.warn(
          "Pending resource was created, but Resource Discovery candidate status could not be updated.",
          statusError,
        );
      }
    }

    return NextResponse.json({
      success: true,
      candidate: candidateId
        ? {
            id: candidateId,
            reviewStatus: "Created",
          }
        : null,
      resource,
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Invalid")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return resourceGuideIntelligenceErrorResponse(error);
  }
}

function readRequiredString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid ${fieldName}`);
  }

  return value.trim();
}

function readOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
