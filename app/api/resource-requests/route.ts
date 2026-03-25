import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const supabase = await createClient();

  const { error } = await supabase
    .from('messages')
    .insert({
        content: body.message,
        contact_email: body.contact_email || null,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}