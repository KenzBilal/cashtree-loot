// app/api/admin/leads/route.js
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

export async function GET() {
  try {
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

    // 🔐 admin role check (read-only)
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

    // 📋 fetch pending leads (read-only)
    const { data: leads, error: leadsError } = await supabaseAdmin
      .from('leads')
      .select(`
        id,
        created_at,
        status,
        campaigns ( title ),
        accounts ( username )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (leadsError) {
      return NextResponse.json({ message: 'SERVER ERROR' }, { status: 500 });
    }

    // 🎯 normalize response for admin UI
    return NextResponse.json(
      (leads || []).map(l => ({
        id: l.id,
        date: l.created_at,
        campaign: l.campaigns?.title || '—',
        promoter: l.accounts?.username || '—'
      }))
    );

  } catch {
    return NextResponse.json({ message: 'SERVER ERROR' }, { status: 500 });
  }
}
