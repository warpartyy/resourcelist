import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { buildWeeklyDigestSummary } from "@/lib/services/engagement/digest/digestService";
import { sendWeeklyDigestEngagement } from "@/lib/services/engagement/engagementService";

export async function POST() {
  try {
    await requireAdminUser();
    const summary = await buildWeeklyDigestSummary();
    const result = await sendWeeklyDigestEngagement(summary);

    return NextResponse.json({
      success: true,
      eventId: result.event.id,
      queuedEmails: result.queuedEmails,
      sentEmails: result.sentEmails,
      summary,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";

    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    if (message === "Forbidden") {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    console.error("Weekly engagement digest failed", error);
    return NextResponse.json(
      { error: "Failed to send weekly digest" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  void req;
  return POST();
}

async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || profile?.role !== "admin") {
    throw new Error("Forbidden");
  }
}
