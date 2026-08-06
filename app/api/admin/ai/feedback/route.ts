import { NextRequest, NextResponse } from "next/server";
import { getAiFeedbackReport } from "@/lib/services/resources/ai/feedback/service";

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await getAiFeedbackReport());
  } catch (error) {
    console.error("AI feedback report API error", error);
    return NextResponse.json(
      { error: "Failed to load feedback report" },
      { status: 500 }
    );
  }
}

function isAuthorized(req: NextRequest): boolean {
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  const regressionKey = process.env.ADMIN_REGRESSION_KEY;

  if (!regressionKey) {
    return false;
  }

  return req.headers.get("x-admin-regression-key") === regressionKey;
}
