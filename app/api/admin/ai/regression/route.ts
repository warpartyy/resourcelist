import { NextRequest, NextResponse } from "next/server";
import { runRegressionSuite } from "@/lib/services/resources/testing/runner";

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(runRegressionSuite());
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
