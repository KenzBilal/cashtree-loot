import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 0;

// 1. PUBLIC CLIENT (For checking if the token is valid)
const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 2. ADMIN CLIENT (The "Master Key" - bypasses RLS permissions)
// We use this to fetch data without getting blocked
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('ct_session')?.value;

  // --- CHECK 1: Token Exists? ---
  if (!token) {
    redirect('/login');
  }

  // --- CHECK 2: Is Token Valid? (Use Public Client) ---
  const { data: { user }, error: authError } = await supabasePublic.auth.getUser(token);
  
  if (authError || !user) {
    redirect('/login');
  }

  // --- CHECK 3: Fetch Profile (Use ADMIN Client to avoid permission errors) ---
  const { data: account, error: dbError } = await supabaseAdmin
    .from('accounts')
    .select('*')
    .eq('id', user.id)
    .single();

  // Handle Missing Profile
  if (dbError || !account) {
    return (
      <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#04060a', color: '#ef4444', flexDirection: 'column', gap: '20px'}}>
        <h2>Profile Error</h2>
        <p>We found your login, but could not load your profile.</p>
        <p style={{fontSize:'12px', fontFamily:'monospace'}}>Error: {dbError?.message || "No Account Row"}</p>
        <form action={async () => { 'use server'; redirect('/login'); }}>
           <button style={{padding: '10px 20px', background: '#333', color: 'white', border: 'none', borderRadius: '5px'}}>Back to Login</button>
        </form>
      </div>
    );
  }

  // 4. GET CAMPAIGNS (Use ADMIN Client)
  const { data: campaignsRaw } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .eq('status', 'active')
    .limit(5);

  const campaigns = campaignsRaw || [];

  // --- STYLES ---
  const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
  const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' };
  const cardStyle = { background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' };
  const statLabelStyle = { fontSize: '11px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' };
  const statValueStyle = { fontSize: '24px', fontWeight: '900', color: 'var(--text)' };
  const listContainerStyle = { ...cardStyle, padding: '0' };
  const listItemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)', textDecoration: 'none' };

  return (
    <div style={{paddingBottom: '80px'}}>
      
      {/* HEADER */}
      <div style={headerStyle}>
        <div>
          <h1 style={{fontSize: '20px', fontWeight: '800', margin: 0}}>Overview</h1>
          <p style={{fontSize: '13px', color: 'var(--muted)', margin: 0}}>Welcome back, {account.username}</p>
        </div>
        <div style={{background: 'rgba(34, 197, 94, 0.1)', color: 'var(--accent)', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(34, 197, 94, 0.2)'}}>
          {account.role === 'admin' ? 'ADMIN' : 'PROMOTER'}
        </div>
      </div>

      {/* STATS GRID */}
      <div style={gridStyle}>
        <div style={cardStyle}>
          <div style={statLabelStyle}>Wallet Balance</div>
          <div style={statValueStyle}>₹{account.wallet_balance || 0}</div>
        </div>
        <div style={cardStyle}>
          <div style={statLabelStyle}>Status</div>
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
        {campaigns.length > 0 ? campaigns.map(camp => (
          <Link href={`/dashboard/tasks/${camp.id}`} key={camp.id} style={listItemStyle}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <div style={{width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'}}>🔥</div>
              <div>
                <div style={{fontWeight: '700', fontSize: '14px'}}>{camp.title}</div>
                <div style={{fontSize: '12px', color: 'var(--muted)'}}>Get ₹{camp.payout_amount}</div>
              </div>
            </div>
            <div style={{background: 'var(--bg-1)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold'}}>
              START
            </div>
          </Link>
        )) : (
           <div style={{padding: '30px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px'}}>No active campaigns right now.</div>
        )}
      </div>

    </div>
  );
}