// app/api/admin/reject-withdraw/route.js

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// anon client ONLY for auth verification
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

    // 🔐 admin role check
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

    // 🚫 reject withdrawal (ONLY if pending)
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('withdraw_requests')
      .update({
        status: 'rejected',
        processed_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .eq('status', 'pending')
      .select('id, amount')
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { message: 'REQUEST_ALREADY_PROCESSED' },
        { status: 400 }
      );
    }

    // 🧾 audit log
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: authData.user.id,
      actor_role: 'admin',
      action: 'reject_withdraw',
      target_type: 'withdraw_request',
      target_id: requestId,
      metadata: { amount: updated.amount }
    });

    return NextResponse.json({ success: true });

  } catch {
    return NextResponse.json({ message: 'FAILED' }, { status: 500 });
  }
}
