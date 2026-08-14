import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { handleAdminMentionedEngagement } from "@/lib/services/engagement/engagementService";

type AdminMentionedRequestBody = {
  resourceId?: unknown;
  resourceName?: unknown;
  commentId?: unknown;
  commentPreview?: unknown;
  section?: unknown;
  mentionedUserIds?: unknown;
};

const VALID_SECTIONS = new Set(["pending", "resources", "rejected"]);

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdminUser();
    const body = (await req.json()) as AdminMentionedRequestBody;
    const payload = {
      resourceId: readRequiredString(body.resourceId, "resourceId"),
      resourceName: readRequiredString(body.resourceName, "resourceName"),
      commentId: readRequiredString(body.commentId, "commentId"),
      commentPreview: readRequiredString(body.commentPreview, "commentPreview"),
      section: readSection(body.section),
      mentionedUserIds: readRequiredStringArray(
        body.mentionedUserIds,
        "mentionedUserIds"
      ),
    };

    const result = await handleAdminMentionedEngagement({
      actor: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      payload,
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

    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    if (message === "Forbidden") {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    if (message.startsWith("Invalid") || message.endsWith("is required")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("Admin mention engagement error", error);
    return NextResponse.json(
      { error: "Failed to process engagement event" },
      { status: 500 }
    );
  }
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
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  if (error || profile?.role !== "admin") {
    throw new Error("Forbidden");
  }

  return {
    id: user.id,
    email: user.email ?? null,
    displayName: profile.display_name,
  };
}

function readRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} is required`);
  }

  return value.trim();
}

function readRequiredStringArray(value: unknown, fieldName: string): string[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 25) {
    throw new Error(`Invalid ${fieldName}`);
  }

  const values = value.filter(
    (item): item is string => typeof item === "string" && Boolean(item.trim())
  );

  if (values.length === 0) {
    throw new Error(`Invalid ${fieldName}`);
  }

  return Array.from(new Set(values.map((item) => item.trim())));
}

function readSection(value: unknown): "pending" | "resources" | "rejected" {
  if (typeof value === "string" && VALID_SECTIONS.has(value)) {
    return value as "pending" | "resources" | "rejected";
  }

  throw new Error("Invalid section");
}
