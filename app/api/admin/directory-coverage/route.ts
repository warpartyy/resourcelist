import { NextRequest, NextResponse } from "next/server";
import {
  authorizeResourceGuideIntelligenceRequest,
  resourceGuideIntelligenceErrorResponse,
  unauthorizedResourceGuideIntelligenceResponse,
} from "@/app/api/admin/resource-guide/intelligence/auth";
import {
  getDirectoryCoverageReport,
  readDirectoryCoverageFilters,
} from "@/lib/services/admin/directory-coverage/coverage";

export async function GET(req: NextRequest) {
  const authorization = await authorizeResourceGuideIntelligenceRequest(req);

  if (!authorization.authorized) {
    return unauthorizedResourceGuideIntelligenceResponse(authorization.status);
  }

  try {
    const filters = readDirectoryCoverageFilters(req);
    const report = await getDirectoryCoverageReport(filters);
    return NextResponse.json(report);
  } catch (error) {
    return resourceGuideIntelligenceErrorResponse(error);
  }
}
