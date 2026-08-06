import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type ResourceGuideIntelligenceAuthorization =
  | { authorized: true }
  | { authorized: false; status: 401 | 403 };

export async function authorizeResourceGuideIntelligenceRequest(
  req: NextRequest
): Promise<ResourceGuideIntelligenceAuthorization> {
  if (hasValidRegressionKey(req)) {
    return { authorized: true };
  }

  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return { authorized: false, status: 401 };
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseAdmin = getSupabaseAdmin();
  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return { authorized: false, status: 401 };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    return { authorized: false, status: 403 };
  }

  return { authorized: true };
}

function hasValidRegressionKey(req: NextRequest): boolean {
  const regressionKey = process.env.ADMIN_REGRESSION_KEY;

  return Boolean(
    regressionKey && req.headers.get("x-admin-regression-key") === regressionKey
  );
}

export function unauthorizedResourceGuideIntelligenceResponse(
  status: 401 | 403 = 401
) {
  return NextResponse.json(
    { error: status === 403 ? "Forbidden" : "Unauthorized" },
    { status }
  );
}

export function resourceGuideIntelligenceErrorResponse(error: unknown) {
  console.error("Resource Guide intelligence API error", error);

  return NextResponse.json(
    { error: "Failed to load Resource Guide intelligence report" },
    { status: 500 }
  );
}
