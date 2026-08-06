import { NextRequest, NextResponse } from "next/server";
import { getResourceGuideResourcePerformanceReport } from "@/lib/services/resources/ai/intelligence/reporting/resources";
import { readIntelligenceReportFilters } from "@/lib/services/resources/ai/intelligence/reporting/filters";
import { buildReportResponse } from "@/lib/services/resources/ai/intelligence/reporting/types";
import {
  isAuthorizedResourceGuideIntelligenceRequest,
  resourceGuideIntelligenceErrorResponse,
  unauthorizedResourceGuideIntelligenceResponse,
} from "../auth";

export async function GET(req: NextRequest) {
  if (!isAuthorizedResourceGuideIntelligenceRequest(req)) {
    return unauthorizedResourceGuideIntelligenceResponse();
  }

  try {
    const filters = readIntelligenceReportFilters(req);
    const data = await getResourceGuideResourcePerformanceReport(filters);
    return NextResponse.json(buildReportResponse(filters, data));
  } catch (error) {
    return resourceGuideIntelligenceErrorResponse(error);
  }
}
