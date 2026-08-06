import { NextRequest, NextResponse } from "next/server";

export function isAuthorizedResourceGuideIntelligenceRequest(
  req: NextRequest
): boolean {
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  const regressionKey = process.env.ADMIN_REGRESSION_KEY;

  if (!regressionKey) {
    return false;
  }

  return req.headers.get("x-admin-regression-key") === regressionKey;
}

export function unauthorizedResourceGuideIntelligenceResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function resourceGuideIntelligenceErrorResponse(error: unknown) {
  console.error("Resource Guide intelligence API error", error);

  return NextResponse.json(
    { error: "Failed to load Resource Guide intelligence report" },
    { status: 500 }
  );
}
