// app/api/admin/approve-withdraw/route.js
export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

export async function POST(req) {
  try {
    const { requestId } = await req.json();
    if (!requestId) {
      return NextResponse.json({ message: 'INVALID_REQUEST' }, { status: 400 });
    }

    // 🔐 Auth: validate session (anon client)
    const token = cookies().get('ct_session')?.value;
    if (!token) {
      return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { data: authData, error: authError } =
      await supabaseAuth.auth.getUser(token);

    if (authError || !authData?.user) {
      return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });
    }

    // 🔐 Role check (service role, read-only)
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('accounts')
      .select('role, is_frozen')
      .eq('id', authData.user.id)
      .single();

    if (
      adminError ||
      !admin ||
      admin.role !== 'admin' ||
      admin.is_frozen
    ) {
      return NextResponse.json({ message: 'FORBIDDEN' }, { status: 403 });
    }

    // 💰 Approve withdrawal (DB function = single source of truth)
    const { error: rpcError } = await supabaseAdmin.rpc(
      'approve_withdraw_request',
      { req_id: requestId }
    );

    if (rpcError) {
      return NextResponse.json(
        { message: rpcError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ message: 'FAILED' }, { status: 500 });
  }
}
