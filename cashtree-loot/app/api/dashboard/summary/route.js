export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export async function GET() {
  try {
    const token = cookies().get('ct_session')?.value;
    if (!token) return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });

    const { data: auth } = await supabase.auth.getUser(token);
    if (!auth?.user) return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });

    const userId = auth.user.id;

    const { data: account } = await supabase
      .from('accounts')
      .select('username, role, wallet_balance, is_frozen')
      .eq('id', userId)
      .single();

    if (!account || account.role !== 'promoter' || account.is_frozen)
      return NextResponse.json({ message: 'FORBIDDEN' }, { status: 403 });

    /* ---------- TEAM STATS ---------- */
    const { count: teamCount } = await supabase
      .from('accounts')
      .select('*', { count: 'exact', head: true })
      .eq('referred_by', userId);

    const { data: teamLedger } = await supabase
      .from('ledger')
      .select('amount')
      .eq('referrer_id', userId);

    const teamEarnings = (teamLedger || []).reduce((s, r) => s + Number(r.amount), 0);

    /* ---------- CAMPAIGNS ---------- */
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, title, promoter_payout')
      .eq('active', true);

    /* ---------- FINAL ---------- */
    return NextResponse.json({
      username: account.username,
      balance: account.wallet_balance,
      teamCount: teamCount || 0,
      teamEarnings,
      minPayout: 500,
      withdrawalPending: false,
      referralLink: `https://cashttree.online/?ref=${account.username}`,
      campaigns: (campaigns || []).map(c => ({
        title: c.title,
        payout: c.promoter_payout,
        link: `https://cashttree.online/${c.id}?ref=${account.username}`
      })),
      broadcast: null
    });

  } catch {
    return NextResponse.json({ message: 'SERVER ERROR' }, { status: 500 });
  }
}
