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

  // 2. FETCH EVERYTHING (Parallel Fetch)
  const [
    { data: account },
    { data: ledger },
    { data: withdrawals },
    { data: config }
  ] = await Promise.all([
    supabase.from('accounts').select('upi_id').eq('id', user.id).single(),
    supabase.from('ledger').select('amount').eq('account_id', user.id),
    supabase.from('withdrawals')
      .select('id, amount, status, created_at')
      .eq('account_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('system_config').select('min_withdrawal').eq('id', 1).single()
  ]);

  // 3. DO THE MATH
  const totalEarnings = ledger?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0;

  const totalWithdrawn = withdrawals?.reduce((sum, tx) => {
    if (['pending', 'paid'].includes(tx.status)) {
      return sum + Number(tx.amount);
    }
    return sum;
  }, 0) || 0;

  const availableBalance = totalEarnings - totalWithdrawn;
  const minLimit = config?.min_withdrawal || 500;

  // --- PREMIUM GLASS STYLES ---
  const headerStyle = { marginBottom: '30px', textAlign: 'center' };
  
  const neonTitle = {
    fontSize: '24px', 
    fontWeight: '900', 
    color: '#fff', 
    marginBottom: '8px',
    textShadow: '0 0 15px rgba(255,255,255,0.2)'
  };

  const balanceCard = {
    background: 'linear-gradient(145deg, rgba(20, 20, 20, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 255, 136, 0.2)',
    borderRadius: '24px',
    padding: '30px',
    textAlign: 'center',
    marginBottom: '30px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 0 30px rgba(0, 255, 136, 0.1)'
  };

  return (
    <div className="fade-in" style={{paddingBottom: '100px'}}>
      
      {/* HEADER */}
      <div style={headerStyle}>
        <h1 style={neonTitle}>My Wallet</h1>
        <p style={{
          color: '#888', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px',
          background: 'rgba(255,255,255,0.05)', display: 'inline-block', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)'
        }}>
          Manage your earnings
        </p>
      </div>

      {/* BALANCE CARD */}
      <div style={balanceCard}>
        {/* Glow Blob */}
        <div style={{position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '200px', background: '#00ff88', filter: 'blur(100px)', opacity: 0.15}}></div>

        <div style={{fontSize: '11px', fontWeight: '800', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '2px'}}>Available Balance</div>
        <div style={{
          fontSize: '48px', fontWeight: '900', letterSpacing: '-1px', color: '#fff',
          textShadow: '0 0 20px rgba(0, 255, 136, 0.5)', fontFamily: 'sans-serif'
        }}>
          ₹{availableBalance.toLocaleString()}
        </div>
        <div style={{fontSize: '12px', marginTop: '10px', color: '#666', fontWeight: 'bold'}}>
          Lifetime Earnings: <span style={{color: '#fff'}}>₹{totalEarnings.toLocaleString()}</span>
        </div>
      </div>

      {/* WITHDRAWAL FORM */}
      <div style={{marginBottom: '30px'}}>
        <h3 style={{fontSize: '14px', fontWeight: '800', color: '#fff', marginBottom: '15px', paddingLeft: '10px', textTransform: 'uppercase', letterSpacing: '1px'}}>Request Payout</h3>
        <WithdrawForm 
          maxAmount={availableBalance} 
          defaultUpi={account?.upi_id} 
          userId={user.id} 
          minLimit={minLimit}
        />
      </div>

      {/* HISTORY */}
      <h3 style={{fontSize: '14px', fontWeight: '800', color: '#fff', marginBottom: '15px', paddingLeft: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px', textTransform: 'uppercase', letterSpacing: '1px'}}>
        Transaction History
      </h3>
      
      <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
        {withdrawals && withdrawals.length > 0 ? (
          withdrawals.map((tx) => <TransactionItem key={tx.id} tx={tx} />)
        ) : (
          <div style={{padding: '30px', textAlign: 'center', color: '#666', fontSize: '13px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', background: 'rgba(255,255,255,0.02)'}}>
            No transactions yet.
          </div>
        )}
      </div>

    </div>
  );
}

// ---------------------------------------------------------
// COMPONENT: TRANSACTION ITEM (GLASS EDITION)
// ---------------------------------------------------------
function TransactionItem({ tx }) {
  // Config Status Colors
  const statusConfig = {
    approved: { color: '#00ff88', label: 'PAID', shadow: '0 0 10px rgba(0,255,136,0.2)' }, 
    paid:     { color: '#00ff88', label: 'PAID', shadow: '0 0 10px rgba(0,255,136,0.2)' },
    pending:  { color: '#facc15', label: 'PENDING', shadow: 'none' },
    rejected: { color: '#f87171', label: 'REJECTED', shadow: 'none' }
  };

  const config = statusConfig[tx.status] || statusConfig.pending;
  const dateStr = new Date(tx.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '16px 20px', 
      borderRadius: '16px', 
      background: 'rgba(255, 255, 255, 0.03)', 
      backdropFilter: 'blur(10px)',
      border: `1px solid ${config.color}33`, // Transparent version of status color
      boxShadow: config.shadow
    }}>
      <div>
        <div style={{fontSize: '14px', fontWeight: 'bold', color: '#fff', marginBottom: '4px'}}>
          Withdrawal Request
        </div>
        <div style={{fontSize: '11px', color: '#888', fontFamily: 'monospace'}}>
          {dateStr}
        </div>
      </div>

      <div style={{textAlign: 'right'}}>
        <div style={{fontSize: '16px', fontWeight: '900', color: '#fff'}}>
          ₹{tx.amount}
        </div>
        <div style={{
          fontSize: '10px', fontWeight: '900', color: config.color, 
          marginTop: '4px', letterSpacing: '1px', textShadow: `0 0 10px ${config.color}66`
        }}>
          {config.label}
        </div>
      </div>
    </div>
  );
}