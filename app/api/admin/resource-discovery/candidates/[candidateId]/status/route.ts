import { NextRequest, NextResponse } from "next/server";
import {
  authorizeResourceGuideIntelligenceRequest,
  resourceGuideIntelligenceErrorResponse,
  unauthorizedResourceGuideIntelligenceResponse,
} from "@/app/api/admin/resource-guide/intelligence/auth";
import { updateResourceDiscoveryCandidateStatus } from "@/lib/services/admin/resource-discovery/researchHistory";
import type { ResourceDiscoveryReviewStatus } from "@/lib/services/admin/resource-discovery/types";

const VALID_STATUSES = new Set<ResourceDiscoveryReviewStatus>([
  "New",
  "Reviewed",
  "Created",
  "Dismissed",
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> },
) {
  const authorization = await authorizeResourceGuideIntelligenceRequest(req);

  if (!authorization.authorized) {
    return unauthorizedResourceGuideIntelligenceResponse(authorization.status);
  }

  try {
    const { candidateId } = await params;
    const body = (await req.json()) as { status?: unknown };
    const status = readStatus(body.status);

    await updateResourceDiscoveryCandidateStatus({ candidateId, status });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Invalid")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return resourceGuideIntelligenceErrorResponse(error);
  }
}

function readStatus(value: unknown): ResourceDiscoveryReviewStatus {
  if (typeof value === "string" && VALID_STATUSES.has(value as ResourceDiscoveryReviewStatus)) {
    return value as ResourceDiscoveryReviewStatus;
  }

  throw new Error("Invalid review status");
}
