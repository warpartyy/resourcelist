import { NextRequest, NextResponse } from "next/server";
import {
  getResourceGuideTrendsReport,
  readTrendRange,
} from "@/lib/services/resources/ai/intelligence/reporting/trends";
import { readIntelligenceReportFilters } from "@/lib/services/resources/ai/intelligence/reporting/filters";
import { buildReportResponse } from "@/lib/services/resources/ai/intelligence/reporting/types";
import {
  authorizeResourceGuideIntelligenceRequest,
  resourceGuideIntelligenceErrorResponse,
  unauthorizedResourceGuideIntelligenceResponse,
} from "../auth";

export async function GET(req: NextRequest) {
  const authorization = await authorizeResourceGuideIntelligenceRequest(req);

  if (!authorization.authorized) {
    return unauthorizedResourceGuideIntelligenceResponse(authorization.status);
  }

  try {
    const filters = readIntelligenceReportFilters(req);
    const range = readTrendRange(req.nextUrl.searchParams.get("range"));
    const data = await getResourceGuideTrendsReport(range, filters);
    return NextResponse.json(buildReportResponse(filters, data));
  } catch (error) {
    return resourceGuideIntelligenceErrorResponse(error);
  }
}
