// app/api/admin/invite/route.ts

import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // ✅ 1. Get token from Authorization header
    const authHeader = req.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // ✅ 2. Validate user using token
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ 3. Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ✅ 4. Get request body
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // ✅ 5. Invite user
    const { data, error } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const userId = data.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not returned' },
        { status: 500 }
      );
    }

    // ✅ 6. Ensure profile exists + assign admin role
    const { data: updated } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'admin', email })
      .eq('id', userId)
      .select()
      .single();

    if (!updated) {
      await supabaseAdmin.from('profiles').insert({
        id: userId,
        email,
        role: 'admin',
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Unexpected error' },
      { status: 500 }
    );
  }
}