// app/api/admin/reject-lead/route.js
export const dynamic = 'force-dynamic';

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
    const { leadId } = await req.json();
    if (!leadId) {
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

    // 🚫 reject lead (ONLY if pending)
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('leads')
      .update({ status: 'rejected' })
      .eq('id', leadId)
      .eq('status', 'pending')
      .select('id')
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { message: 'LEAD_ALREADY_PROCESSED' },
        { status: 400 }
      );
    }

    // 🧾 audit log
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: authData.user.id,
      actor_role: 'admin',
      action: 'reject_lead',
      target_type: 'lead',
      target_id: leadId
    });

    return NextResponse.json({ success: true });

  } catch {
    return NextResponse.json({ message: 'FAILED' }, { status: 500 });
  }
}
