// app/api/dashboard/update-password/route.js

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// anon client ONLY for session validation
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

export async function POST(req) {
  try {
    const { password } = await req.json();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { message: 'INVALID_PASSWORD' },
        { status: 400 }
      );
    }

    // 🔐 session check
    const token = cookies().get('ct_session')?.value;
    if (!token) {
      return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { data: authData, error: authError } =
      await supabaseAuth.auth.getUser(token);

    if (authError || !authData?.user) {
      return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });
    }

    const userId = authData.user.id;

    // 🔐 ensure account is active (read-only)
    const { data: account, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('role, is_frozen')
      .eq('id', userId)
      .single();

    if (
      accountError ||
      !account ||
      account.is_frozen
    ) {
      return NextResponse.json({ message: 'FORBIDDEN' }, { status: 403 });
    }

    // 🔑 update password (ADMIN AUTH API — correct usage)
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(userId, { password });

    if (updateError) {
      return NextResponse.json(
        { message: 'UPDATE_FAILED' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });

  } catch {
    return NextResponse.json(
      { message: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
