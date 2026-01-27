import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// ⚡ Force fresh data every time
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function DashboardPage() {
  // 1. GET USER
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div style={{padding: '20px', color: '#fff'}}>Loading profile...</div>;
  }

  // 2. FETCH DATA PARALLEL (Fast)
  const [
    { data: account },
    { data: config },
    { count: leadCount }
  ] = await Promise.all([
    // A. Get Wallet Balance
    supabase.from('accounts').select('username, ledger(amount)').eq('id', user.id).single(),
    
    // B. Get Notice Board
    supabase.from('system_config').select('notice_board').eq('id', 1).single(),
    
    // C. Count Leads
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('promoter_id', user.id)
  ]);

  // Calculate Balance safely
  const balance = account?.ledger?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const username = account?.username || 'Promoter';

  // --- STYLES ---
  const headerStyle = { marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
  const balanceCard = {
    background: 'linear-gradient(135deg, #22c55e, #14532d)',
    borderRadius: '20px',
    padding: '24px',
    color: '#fff',
    boxShadow: '0 10px 20px rgba(34, 197, 94, 0.2)',
    marginBottom: '24px'
  };
  const noticeStyle = {
    background: '#1a1a1a',
    borderLeft: '4px solid #eab308',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '24px',
    fontSize: '13px',
    color: '#ccc',
    lineHeight: '1.5'
  };
  const statGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' };
  const statBox = { background: '#0a0a0a', border: '1px solid #222', borderRadius: '16px', padding: '16px', textAlign: 'center' };

  return (
    <div>
      {/* HEADER */}
      <div style={headerStyle}>
        <div>
          <div style={{fontSize: '11px', color: '#888', fontWeight: '800', letterSpacing: '1px'}}>DASHBOARD</div>
          <div style={{fontSize: '20px', fontWeight: '900', color: '#fff'}}>{username}</div>
        </div>
        <div style={{width: '40px', height: '40px', borderRadius: '50%', background: '#222', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'}}>
          👤
        </div>
      </div>

      {/* BALANCE CARD */}
      <div style={balanceCard}>
        <div style={{fontSize: '12px', fontWeight: '700', opacity: 0.8, marginBottom: '4px', textTransform: 'uppercase'}}>Wallet Balance</div>
        <div style={{fontSize: '36px', fontWeight: '900', letterSpacing: '-1px'}}>₹{balance.toLocaleString()}</div>
        <div style={{marginTop: '16px'}}>
          <Link href="/dashboard/wallet" style={{background: '#fff', color: '#166534', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', textDecoration: 'none', display: 'inline-block'}}>
            Withdraw Money
          </Link>
        </div>
      </div>

      {/* ADMIN NOTICE */}
      {config?.notice_board && (
        <div style={noticeStyle}>
          <div style={{fontSize: '11px', fontWeight: '800', color: '#eab308', marginBottom: '4px', textTransform: 'uppercase'}}>📢 Updates</div>
          {config.notice_board}
        </div>
      )}

      {/* QUICK STATS */}
      <div style={statGrid}>
        <div style={statBox}>
          <div style={{fontSize: '24px', fontWeight: '800', color: '#fff'}}>{leadCount || 0}</div>
          <div style={{fontSize: '10px', color: '#666', fontWeight: '700', textTransform: 'uppercase', marginTop: '4px'}}>Total Leads</div>
        </div>
        <div style={statBox}>
          <div style={{fontSize: '24px', fontWeight: '800', color: '#60a5fa'}}>0</div>
          <div style={{fontSize: '10px', color: '#666', fontWeight: '700', textTransform: 'uppercase', marginTop: '4px'}}>Clicks Today</div>
        </div>
      </div>

      {/* ACTION BUTTON */}
      <Link href="/dashboard/campaigns" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#0a0a0a',
        border: '1px solid #222',
        borderRadius: '16px',
        padding: '20px',
        textDecoration: 'none',
        color: '#fff',
        transition: 'border-color 0.2s'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <div style={{fontSize: '24px'}}>🔥</div>
          <div>
            <div style={{fontWeight: 'bold'}}>Start Earning</div>
            <div style={{fontSize: '12px', color: '#666'}}>View active tasks</div>
          </div>
        </div>
        <div style={{color: '#444'}}>→</div>
      </Link>

    </div>
  );
}