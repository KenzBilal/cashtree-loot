// app/api/admin/stats/route.js

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

    // 📊 basic counts (read-only)
    const [{ count: promoters }, { count: leads }] = await Promise.all([
      supabaseAdmin
        .from('accounts')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'promoter'),

      supabaseAdmin
        .from('leads')
        .select('*', { count: 'exact', head: true })
    ]);

    // 💰 total liability = SUM of all promoter balances (ledger-derived)
    const { data: balances, error: balanceError } = await supabaseAdmin
      .from('promoter_wallet_view')
      .select('balance');

    if (balanceError) {
      return NextResponse.json({ message: 'SERVER ERROR' }, { status: 500 });
    }

    const liability = (balances || []).reduce(
      (sum, row) => sum + Number(row.balance || 0),
      0
    );

    return NextResponse.json({
      promoters: promoters || 0,
      totalLeads: leads || 0,
      liability
    });

  } catch {
    return NextResponse.json({ message: 'SERVER ERROR' }, { status: 500 });
  }
}
