import { NextRequest, NextResponse } from "next/server";
import {
  authorizeResourceGuideIntelligenceRequest,
  resourceGuideIntelligenceErrorResponse,
  unauthorizedResourceGuideIntelligenceResponse,
} from "@/app/api/admin/resource-guide/intelligence/auth";
import { getResourceDiscoverySession } from "@/lib/services/admin/resource-discovery/researchHistory";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const authorization = await authorizeResourceGuideIntelligenceRequest(req);

  if (!authorization.authorized) {
    return unauthorizedResourceGuideIntelligenceResponse(authorization.status);
  }

  try {
    const { sessionId } = await params;
    const savedSession = await getResourceDiscoverySession(sessionId);

    if (!savedSession) {
      return NextResponse.json({ error: "Research session not found" }, { status: 404 });
    }

    return NextResponse.json(savedSession);
  } catch (error) {
    return resourceGuideIntelligenceErrorResponse(error);
  }
}
