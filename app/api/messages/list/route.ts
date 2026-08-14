import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type ContactReplyRow = {
  id: string;
  contact_message_id: string;
  message: string;
  sent_by: string | null;
  sent_at: string;
  profiles?: {
    display_name: string | null;
    email: string | null;
  } | null;
};

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const messageIds = (data ?? []).map((message) => message.id);

  if (messageIds.length === 0) {
    return NextResponse.json(data);
  }

  const { data: replies, error: repliesError } = await supabase
    .from("contact_message_replies" as never)
    .select("*, profiles:sent_by(display_name, email)")
    .in("contact_message_id" as never, messageIds as never)
    .order("sent_at", { ascending: true })
    .returns<ContactReplyRow[]>();

  if (repliesError) {
    console.error("Failed to load contact message replies", repliesError);

    return NextResponse.json(
      (data ?? []).map((message) => ({
        ...message,
        replies: [],
      })),
    );
  }

  const repliesByMessageId = new Map<string, ContactReplyRow[]>();

  for (const reply of replies ?? []) {
    const existing = repliesByMessageId.get(reply.contact_message_id) ?? [];
    existing.push(reply);
    repliesByMessageId.set(reply.contact_message_id, existing);
  }

  return NextResponse.json(
    (data ?? []).map((message) => ({
      ...message,
      replies: repliesByMessageId.get(message.id) ?? [],
    })),
  );
}
