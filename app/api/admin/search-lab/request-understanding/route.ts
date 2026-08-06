import { NextRequest, NextResponse } from "next/server";
import {
  authorizeResourceGuideIntelligenceRequest,
  unauthorizedResourceGuideIntelligenceResponse,
} from "@/app/api/admin/resource-guide/intelligence/auth";
import { extractAiRequestUnderstanding } from "@/lib/services/resources/ai/request-understanding/extractRequestUnderstanding";

type RequestBody = {
  message?: unknown;
};

export async function POST(req: NextRequest) {
  const authorization = await authorizeResourceGuideIntelligenceRequest(req);

  if (!authorization.authorized) {
    return unauthorizedResourceGuideIntelligenceResponse(authorization.status);
  }

  const body = (await req.json().catch(() => ({}))) as RequestBody;

  if (typeof body.message !== "string") {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const understanding = await extractAiRequestUnderstanding({
    message: body.message,
  });

  return NextResponse.json({ understanding });
}
