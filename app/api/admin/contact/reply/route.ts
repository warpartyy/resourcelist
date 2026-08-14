import { NextRequest, NextResponse } from "next/server";
import {
  authorizeResourceGuideIntelligenceRequest,
  unauthorizedResourceGuideIntelligenceResponse,
} from "@/app/api/admin/resource-guide/intelligence/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/services/email/emailService";

type ContactReplyRequestBody = {
  messageId?: unknown;
  reply?: unknown;
};

type ContactMessageRow = {
  id: string;
  content: string;
  contact_email: string | null;
  status: string | null;
  created_at: string | null;
};

type ContactReplyRow = {
  id: string;
  contact_message_id: string;
  message: string;
  sent_by: string | null;
  sent_at: string;
};

export async function POST(req: NextRequest) {
  const authorization = await authorizeResourceGuideIntelligenceRequest(req);

  if (!authorization.authorized) {
    return unauthorizedResourceGuideIntelligenceResponse(authorization.status);
  }

  try {
    const adminUserId = await getAuthorizedAdminUserId(req);
    const body = (await req.json()) as ContactReplyRequestBody;
    const messageId = readRequiredString(body.messageId, "messageId");
    const reply = readRequiredString(body.reply, "reply");
    const supabaseAdmin = getSupabaseAdmin();

    const { data: originalMessage, error: messageError } = await supabaseAdmin
      .from("messages")
      .select("id, content, contact_email, status, created_at")
      .eq("id", messageId)
      .single<ContactMessageRow>();

    if (messageError || !originalMessage) {
      return NextResponse.json(
        { error: "Contact message not found" },
        { status: 404 },
      );
    }

    if (!originalMessage.contact_email) {
      return NextResponse.json(
        { error: "Original message does not include a reply email" },
        { status: 400 },
      );
    }

    await sendEmail({
      to: originalMessage.contact_email,
      subject: "Re: Contact Message",
      text: buildReplyText({
        reply,
        originalMessage: originalMessage.content,
      }),
      html: buildReplyHtml({
        reply,
        originalMessage: originalMessage.content,
      }),
    });

    const now = new Date().toISOString();
    const { data: savedReply, error: replyError } = await supabaseAdmin
      .from("contact_message_replies" as never)
      .insert({
        contact_message_id: messageId,
        message: reply,
        sent_by: adminUserId,
        sent_at: now,
      } as never)
      .select("*")
      .single<ContactReplyRow>();

    if (replyError) {
      throw replyError;
    }

    const { data: updatedMessages, error: updateError } = await supabaseAdmin
      .from("messages")
      .update({
        responded_at: now,
        status: "resolved",
      })
      .eq("id", messageId)
      .select("id, status, responded_at");

    if (updateError) {
      throw updateError;
    }

    const updatedMessage = Array.isArray(updatedMessages)
      ? updatedMessages[0]
      : updatedMessages;

    return NextResponse.json({
      success: true,
      reply: savedReply,
      message: updatedMessage,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.startsWith("Invalid")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    console.error("Failed to send contact reply", error);
    return NextResponse.json(
      { error: "Failed to send contact reply" },
      { status: 500 },
    );
  }
}

async function getAuthorizedAdminUserId(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseAdmin = getSupabaseAdmin();
  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(token);

  return user?.id ?? null;
}

function readRequiredString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid ${fieldName}`);
  }

  return value.trim();
}

function buildReplyText({
  reply,
  originalMessage,
}: {
  reply: string;
  originalMessage: string;
}) {
  return `${reply}

-----------------------

Original Message

Subject:
Contact Message

Message:
${originalMessage}`;
}

function buildReplyHtml({
  reply,
  originalMessage,
}: {
  reply: string;
  originalMessage: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
      ${formatEmailParagraphs(reply)}
      <hr style="margin: 24px 0; border: 0; border-top: 1px solid #d1d5db;" />
      <p><strong>Original Message</strong></p>
      <p><strong>Subject:</strong><br />Contact Message</p>
      <p><strong>Message:</strong><br />${escapeHtml(originalMessage).replace(/\n/g, "<br />")}</p>
    </div>
  `;
}

function formatEmailParagraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
