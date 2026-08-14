import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { handleResourceSubmittedEngagement } from "@/lib/services/engagement/engagementService";

type ResourceSubmittedRequestBody = {
  slug?: unknown;
  organization?: unknown;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ResourceSubmittedRequestBody;
    const slug = readRequiredString(body.slug, "slug");
    const organization = readRequiredString(body.organization, "organization");
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("resources")
      .select("id, organization, slug, city, state, submitted_at")
      .eq("slug", slug)
      .eq("status", "pending")
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: "Pending resource not found" },
        { status: 404 }
      );
    }

    const result = await handleResourceSubmittedEngagement({
      resourceId: data.id,
      organization: data.organization || organization,
      slug: data.slug,
      city: data.city,
      state: data.state,
      submissionDate: data.submitted_at,
    });

    return NextResponse.json({
      success: true,
      eventId: result.event.id,
      dashboardNotifications: result.dashboardNotifications,
      queuedEmails: result.queuedEmails,
      sentEmails: result.sentEmails,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";

    if (message.endsWith("is required")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("Resource submitted engagement error", error);
    return NextResponse.json(
      { error: "Failed to process engagement event" },
      { status: 500 }
    );
  }
}

function readRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} is required`);
  }

  return value.trim();
}
