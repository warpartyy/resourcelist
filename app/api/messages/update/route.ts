import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const supabase = await createClient();

  const { id, status } = body;

  const { data, error } = await supabase
    .from('messages')
    .update({ status })
    .eq('id', id)
    .select();

  console.log('UPDATE RESULT:', { data, error });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}