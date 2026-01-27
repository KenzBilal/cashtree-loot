import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import WalletInterface from './WalletInterface'; // Use the new UI

export const revalidate = 0; 

export default async function WalletPage() {
  // 1. AUTH
  const cookieStore = await cookies();
  const token = cookieStore.get('ct_session')?.value;
  if (!token) redirect('/login');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. FETCH DATA
  const [
    { data: account },
    { data: ledger },
    { data: withdrawals },
    { data: config }
  ] = await Promise.all([
    supabase.from('accounts').select('upi_id').eq('id', user.id).single(),
    supabase.from('ledger').select('amount').eq('account_id', user.id),
    supabase.from('withdrawals').select('*').eq('account_id', user.id).order('created_at', { ascending: false }),
    supabase.from('system_config').select('min_withdrawal').eq('id', 1).single()
  ]);

  // 3. CALCS
  const totalEarnings = ledger?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0;
  const totalWithdrawn = withdrawals?.reduce((sum, tx) => {
    if (['pending', 'paid', 'approved'].includes(tx.status)) return sum + Number(tx.amount);
    return sum;
  }, 0) || 0;

  const availableBalance = totalEarnings - totalWithdrawn;
  const minLimit = config?.min_withdrawal || 500;

  return (
    <div style={{paddingBottom: '100px'}}>
      <WalletInterface 
        balance={availableBalance}
        lifetime={totalEarnings}
        minLimit={minLimit}
        upiId={account?.upi_id}
        userId={user.id}
        history={withdrawals || []}
      />
    </div>
  );
}