import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Force dynamic so we always get fresh stats
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('ct_session')?.value;
  
  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser(token);
  
  // 2. Get Account Data (Wallet)
  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', user.id)
    .single();

  // 3. Get Recent Tasks (Active Campaigns)
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('status', 'active')
    .limit(5);

  // --- STYLES ---
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', // 2 columns
    gap: '15px',
    marginBottom: '30px'
  };

  const cardStyle = {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '20px'
  };

  const statLabelStyle = {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '5px'
  };

  const statValueStyle = {
    fontSize: '24px',
    fontWeight: '900',
    color: 'var(--text)'
  };

  const listContainerStyle = {
    ...cardStyle,
    padding: '0'
  };

  const listItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border)',
    textDecoration: 'none'
  };

  return (
    <div style={{paddingBottom: '80px'}}>
      
      {/* HEADER */}
      <div style={headerStyle}>
        <div>
          <h1 style={{fontSize: '20px', fontWeight: '800', margin: 0}}>Overview</h1>
          <p style={{fontSize: '13px', color: 'var(--muted)', margin: 0}}>Welcome back, {account.username}</p>
        </div>
        <div style={{background: 'rgba(34, 197, 94, 0.1)', color: 'var(--accent)', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(34, 197, 94, 0.2)'}}>
          PROMOTER
        </div>
      </div>

      {/* STATS GRID */}
      <div style={gridStyle}>
        {/* Wallet */}
        <div style={cardStyle}>
          <div style={statLabelStyle}>Wallet Balance</div>
          <div style={statValueStyle}>₹{account.wallet_balance}</div>
        </div>
        {/* Frozen Status */}
        <div style={cardStyle}>
          <div style={statLabelStyle}>Account Status</div>
          <div style={{...statValueStyle, color: account.is_frozen ? '#ef4444' : '#22c55e', fontSize: '18px'}}>
            {account.is_frozen ? 'FROZEN' : 'ACTIVE'}
          </div>
        </div>
      </div>

      {/* QUICK TASKS */}
      <h3 style={{fontSize: '16px', fontWeight: '700', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        Active Tasks 
        <Link href="/dashboard/tasks" style={{fontSize: '12px', color: 'var(--accent)'}}>View All →</Link>
      </h3>

      <div style={listContainerStyle}>
        {campaigns && campaigns.map(camp => (
          <Link href={`/dashboard/tasks/${camp.id}`} key={camp.id} style={listItemStyle}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <div style={{width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'}}>
                🔥
              </div>
              <div>
                <div style={{fontWeight: '700', fontSize: '14px'}}>{camp.title}</div>
                <div style={{fontSize: '12px', color: 'var(--muted)'}}>Get ₹{camp.payout_amount}</div>
              </div>
            </div>
            <div style={{background: 'var(--bg-1)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold'}}>
              START
            </div>
          </Link>
        ))}
        {campaigns.length === 0 && (
          <div style={{padding: '30px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px'}}>
            No active campaigns right now.
          </div>
        )}
      </div>

    </div>
  );
}