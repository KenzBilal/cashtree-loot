import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import WithdrawForm from './withdraw-form';

export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function WalletPage() {
  // 1. GET USER
  const cookieStore = cookies();
  const token = cookieStore.get('ct_session')?.value;
  const { data: { user } } = await supabase.auth.getUser(token);

  // 2. FETCH ACCOUNT (For UPI ID)
  const { data: account } = await supabase
    .from('accounts')
    .select('upi_id')
    .eq('id', user.id)
    .single();

  // 3. CALCULATE BALANCE (Live from Ledger)
  const { data: ledger } = await supabase
    .from('ledger')
    .select('amount')
    .eq('account_id', user.id);

  const balance = ledger?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0;

  // 4. FETCH HISTORY
  const { data: history } = await supabase
    .from('withdraw_requests')
    .select('*')
    .eq('promoter_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8 pb-24">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black text-white">Your Wallet</h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
          Withdraw your earnings
        </p>
      </div>

      {/* WITHDRAWAL FORM (Client Component) */}
      <WithdrawForm 
        balance={balance} 
        upiId={account?.upi_id} 
        userId={user.id} 
      />

      {/* HISTORY LIST */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-white/10 pb-2">Transaction History</h3>
        
        {history?.length === 0 ? (
          <div className="text-center text-slate-500 text-xs py-4">No transactions yet.</div>
        ) : (
          history.map((tx) => (
            <div key={tx.id} className="flex justify-between items-center p-4 rounded-xl bg-[#0a0a0a] border border-white/5">
              <div>
                <div className="text-white font-bold text-sm">Withdrawal Request</div>
                <div className="text-[10px] text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-white">₹{tx.amount}</div>
                <StatusBadge status={tx.status} />
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

// Helper Badge
function StatusBadge({ status }) {
  const styles = {
    pending: 'text-amber-500',
    approved: 'text-green-500',
    rejected: 'text-red-500'
  };
  return <div className={`text-[10px] uppercase font-black tracking-widest ${styles[status] || 'text-slate-500'}`}>{status}</div>;
}