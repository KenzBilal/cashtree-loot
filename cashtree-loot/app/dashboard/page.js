import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export const revalidate = 20;

export default async function DashboardPage() {

  const cookieStore = await cookies();
  const token = cookieStore.get('ct_session')?.value;
  if (!token) redirect('/login');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect('/login');

  const [accountRes, configRes, leadsRes, balanceRes, todayRes] = await Promise.all([
    supabase.from('accounts').select('username').eq('id', user.id).single(),
    supabase.from('system_config').select('notice_board').eq('id', 1).single(),
    supabase.from('leads').select('status', { count: 'exact' }).eq('referred_by', user.id),
    supabase.from('account_balances').select('available_balance').eq('account_id', user.id).single(),
    supabase.from('ledger').select('amount').eq('account_id', user.id).gt('amount', 0),
  ]);

  const account          = accountRes.data || { username: 'Promoter' };
  const config           = configRes.data  || {};
  const leads            = leadsRes.data   || [];
  const leadCount        = leadsRes.count  || 0;
  const availableBalance = Number(balanceRes.data?.available_balance ?? 0);
  const allEarnings      = todayRes.data   || [];
  const lifetimeEarnings = allEarnings.reduce((sum, l) => sum + Number(l.amount), 0);

  // Today earnings in IST
  const nowIST   = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const todayIST = nowIST.toISOString().split('T')[0];
  const { data: todayLedger } = await supabase
    .from('ledger')
    .select('amount')
    .eq('account_id', user.id)
    .gt('amount', 0)
    .gte('created_at', `${todayIST}T00:00:00+05:30`);
  const earnedToday = (todayLedger || []).reduce((sum, l) => sum + Number(l.amount), 0);

  const liveLeads = leads.filter(l => l.status === 'approved' || l.status === 'pending').length;

  // Rank based on lifetime earnings (gross)
  let rank = { name: 'INITIATE', next: 1000, progress: 0, tier: 0 };
  if      (lifetimeEarnings > 10000) rank = { name: 'KINGPIN',   next: 0,     progress: 100, tier: 4 };
  else if (lifetimeEarnings > 5000)  rank = { name: 'SYNDICATE', next: 10000, progress: (lifetimeEarnings / 10000) * 100, tier: 3 };
  else if (lifetimeEarnings > 1000)  rank = { name: 'OPERATOR',  next: 5000,  progress: (lifetimeEarnings / 5000)  * 100, tier: 2 };
  else { rank.progress = (lifetimeEarnings / 1000) * 100; rank.tier = 1; }

  return (
    <DashboardClient
      account={account}
      config={config}
      availableBalance={availableBalance}
      lifetimeEarnings={lifetimeEarnings}
      earnedToday={earnedToday}
      leadCount={leadCount}
      liveLeads={liveLeads}
      rank={rank}
    />
  );
}