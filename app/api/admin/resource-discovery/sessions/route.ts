import { NextRequest, NextResponse } from "next/server";
import {
  authorizeResourceGuideIntelligenceRequest,
  resourceGuideIntelligenceErrorResponse,
  unauthorizedResourceGuideIntelligenceResponse,
} from "@/app/api/admin/resource-guide/intelligence/auth";
import { listRecentResourceDiscoverySessions } from "@/lib/services/admin/resource-discovery/researchHistory";

export async function GET(req: NextRequest) {
  const authorization = await authorizeResourceGuideIntelligenceRequest(req);

  if (!authorization.authorized) {
    return unauthorizedResourceGuideIntelligenceResponse(authorization.status);
  }

  try {
    const sessions = await listRecentResourceDiscoverySessions();

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      sessions,
    });
  } catch (error) {
    return resourceGuideIntelligenceErrorResponse(error);
  }
}
