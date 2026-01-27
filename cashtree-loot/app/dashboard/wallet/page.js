import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import WithdrawForm from './WithdrawForm';

export const revalidate = 0; // Always fetch fresh balance

export default async function WalletPage() {
  // 1. AUTHENTICATE
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

  // 2. FETCH EVERYTHING (Parallel Fetch for Speed)
  const [
    { data: account },
    { data: ledger },
    { data: withdrawals },
    { data: config }
  ] = await Promise.all([
    // A. Account for UPI ID
    supabase.from('accounts').select('upi_id').eq('id', user.id).single(),
    
    // B. Ledger for Total Earnings
    supabase.from('ledger').select('amount').eq('account_id', user.id),
    
    // C. Withdrawals for Total Spent
    // We fetch ALL requests to subtract them from the balance
    supabase.from('withdrawals')
      .select('id, amount, status, created_at')
      .eq('account_id', user.id)
      .order('created_at', { ascending: false }),

    // D. System Config for Min Limit
    supabase.from('system_config').select('min_withdrawal').eq('id', 1).single()
  ]);

  // 3. DO THE MATH
  // Formula: Available = (Total Ledger Income) - (Total Pending + Paid Withdrawals)
  
  // A. Total Earnings from Ledger
  const totalEarnings = ledger?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0;

  // B. Total "Locked" Money (Pending or Paid Requests)
  const totalWithdrawn = withdrawals?.reduce((sum, tx) => {
    // We count Pending AND Paid. We don't count Rejected (money returns to wallet).
    if (['pending', 'paid'].includes(tx.status)) {
      return sum + Number(tx.amount);
    }
    return sum;
  }, 0) || 0;

  // C. Final Available Balance
  const availableBalance = totalEarnings - totalWithdrawn;
  const minLimit = config?.min_withdrawal || 500;

  // --- STYLES ---
  const headerStyle = { marginBottom: '30px' };
  const cardStyle = {
    background: 'linear-gradient(135deg, #166534, #064e3b)', borderRadius: '24px', padding: '30px', 
    color: '#fff', boxShadow: '0 10px 30px rgba(22, 101, 52, 0.3)', marginBottom: '30px', textAlign: 'center'
  };

  return (
    <div style={{paddingBottom: '60px'}}>
      
      {/* HEADER */}
      <div style={headerStyle}>
        <h1 style={{fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '8px'}}>My Wallet</h1>
        <p style={{color: '#666', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px'}}>
          Manage your earnings
        </p>
      </div>

      {/* BALANCE CARD */}
      <div style={cardStyle}>
        <div style={{fontSize: '12px', fontWeight: '800', opacity: 0.8, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '2px'}}>Available Balance</div>
        <div style={{fontSize: '48px', fontWeight: '900', letterSpacing: '-2px'}}>
          ₹{availableBalance.toLocaleString()}
        </div>
        <div style={{fontSize: '12px', marginTop: '10px', opacity: 0.7}}>
          Total Earnings: ₹{totalEarnings.toLocaleString()}
        </div>
      </div>

      {/* WITHDRAWAL FORM */}
      <h3 style={{fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '15px', paddingLeft: '10px'}}>Request Payout</h3>
      <WithdrawForm 
        maxAmount={availableBalance} 
        defaultUpi={account?.upi_id} 
        userId={user.id} 
        minLimit={minLimit}
      />

      {/* HISTORY */}
      <h3 style={{fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '15px', paddingLeft: '10px', borderTop: '1px solid #222', paddingTop: '30px'}}>
        Transaction History
      </h3>
      
      <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
        {withdrawals && withdrawals.length > 0 ? (
          withdrawals.map((tx) => <TransactionItem key={tx.id} tx={tx} />)
        ) : (
          <div style={{padding: '30px', textAlign: 'center', color: '#555', fontSize: '13px', border: '1px dashed #222', borderRadius: '16px'}}>
            No transactions yet.
          </div>
        )}
      </div>

    </div>
  );
}

// ---------------------------------------------------------
// COMPONENT: TRANSACTION ITEM
// ---------------------------------------------------------
function TransactionItem({ tx }) {
  // Config Status Colors
  const statusConfig = {
    approved: { color: '#4ade80', label: 'PAID' }, // 'approved' or 'paid'
    paid:     { color: '#4ade80', label: 'PAID' },
    pending:  { color: '#f59e0b', label: 'PENDING' },
    rejected: { color: '#ef4444', label: 'REJECTED' }
  };

  const config = statusConfig[tx.status] || statusConfig.pending;
  const dateStr = new Date(tx.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '16px 20px', borderRadius: '16px', background: '#0a0a0a', border: '1px solid #1a1a1a'
    }}>
      <div>
        <div style={{fontSize: '14px', fontWeight: 'bold', color: '#fff', marginBottom: '4px'}}>
          Withdrawal Request
        </div>
        <div style={{fontSize: '11px', color: '#666', fontFamily: 'monospace'}}>
          {dateStr}
        </div>
      </div>

      <div style={{textAlign: 'right'}}>
        <div style={{fontSize: '16px', fontWeight: '900', color: '#fff'}}>
          ₹{tx.amount}
        </div>
        <div style={{
          fontSize: '10px', fontWeight: '900', color: config.color, 
          marginTop: '4px', letterSpacing: '1px'
        }}>
          {config.label}
        </div>
      </div>
    </div>
  );
}