import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient'; 

export const revalidate = 20 ; // Revalidate every 5 seconds

export default async function DashboardPage() {
  // 1. AUTH & DATA
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

  const [accountRes, configRes, leadsRes] = await Promise.all([
    supabase.from('accounts').select('username, ledger(amount, created_at)').eq('id', user.id).single(),
    supabase.from('system_config').select('notice_board').eq('id', 1).single(),
    supabase.from('leads').select('payout', { count: 'exact' }).eq('referred_by', user.id)
  ]);

  const account = accountRes.data || { username: 'Promoter', ledger: [] };
  const config = configRes.data || {};
  const leadCount = leadsRes.count || 0;
  
  // 2. LOGIC ENGINE
  const totalBalance = account.ledger?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
  
  const today = new Date().toISOString().split('T')[0];
  const earnedToday = account.ledger
    ?.filter(l => l.created_at.startsWith(today) && l.amount > 0)
    .reduce((acc, curr) => acc + curr.amount, 0) || 0;

  // RANK LOGIC (Gamification)
  let rank = { name: 'INITIATE', next: 1000, progress: 0 };
  if (totalBalance > 10000) rank = { name: 'KINGPIN', next: 0, progress: 100 };
  else if (totalBalance > 5000) rank = { name: 'SYNDICATE', next: 10000, progress: (totalBalance/10000)*100 };
  else if (totalBalance > 1000) rank = { name: 'OPERATOR', next: 5000, progress: (totalBalance/5000)*100 };
  else rank.progress = (totalBalance/1000)*100;

  // CHANGE: Point directly to /promoter page
const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL}/promoter?ref=${account.username}`;

  // --- STYLES ---
  const containerStyle = { paddingBottom: '120px', animation: 'fadeIn 0.6s ease-out' };
  const neonGreen = '#00ff88';

  const glassPanel = {
    background: 'rgba(5, 5, 5, 0.7)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)'
  };

  return (
    <div style={containerStyle}>
      
      {/* 1. HEADER */}
      <DashboardClient account={account} referralLink={referralLink} />

      {/* 2. THE VAULT (Balance Card) */}
      <div style={{...glassPanel, background: 'linear-gradient(160deg, #0a0a0a 0%, #000 100%)', marginBottom: '24px'}}>
        <div style={{position:'absolute', top:'-50%', right:'-50%', width:'300px', height:'300px', background:`radial-gradient(circle, ${neonGreen} 0%, transparent 70%)`, opacity:0.15, filter:'blur(80px)'}}></div>
        
        <div style={{position: 'relative', zIndex: 2}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
             <div style={{
               fontSize: '10px', color: '#000', background: neonGreen, 
               padding: '4px 8px', borderRadius: '4px', fontWeight: '900', letterSpacing: '1px',
               boxShadow: `0 0 10px ${neonGreen}66`
             }}>
               RANK: {rank.name}
             </div>
             <div style={{fontSize: '10px', color: '#fff', fontWeight: '700', opacity: 0.7}}>
               LIFETIME EARNINGS
             </div>
          </div>
          
          <div style={{
            fontSize: '52px', fontWeight: '900', color: '#fff', 
            margin: '10px 0', textShadow: `0 0 30px ${neonGreen}33`, letterSpacing: '-2px', lineHeight: '1'
          }}>
            ₹{totalBalance.toLocaleString()}
          </div>
          
          {/* Progress Bar */}
          {rank.next > 0 && (
            <div style={{marginTop: '20px', marginBottom: '24px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#666', marginBottom: '4px', fontWeight: '700'}}>
                <span>PROGRESS TO NEXT LEVEL</span>
                <span>{Math.round(rank.progress)}%</span>
              </div>
              <div style={{height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden'}}>
                <div style={{width: `${rank.progress}%`, height: '100%', background: neonGreen, boxShadow: `0 0 10px ${neonGreen}`}}></div>
              </div>
            </div>
          )}

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
            <Link href="/dashboard/wallet" style={{
              background: '#fff', color: '#000', padding: '14px', borderRadius: '14px',
              textAlign: 'center', fontWeight: '900', fontSize: '13px', textDecoration: 'none',
              textTransform: 'uppercase', border: '1px solid #fff'
            }}>
              Withdraw
            </Link>
            <Link href="/dashboard/leads" style={{
              background: 'transparent', color: '#fff', padding: '14px', borderRadius: '14px',
              textAlign: 'center', fontWeight: '700', fontSize: '13px', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              History
            </Link>
          </div>
        </div>
      </div>

      {/* 3. PERFORMANCE HUD */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '30px'}}>
        {/* Leads */}
        <div style={{...glassPanel, padding: '20px', textAlign: 'center'}}>
          <div style={{fontSize: '32px', fontWeight: '900', color: '#fff'}}>{leadCount}</div>
          <div style={{fontSize: '10px', color: '#666', fontWeight: '800', textTransform: 'uppercase', marginTop: '4px'}}>Total Leads</div>
        </div>
        {/* Today's Gain */}
        <div style={{...glassPanel, padding: '20px', textAlign: 'center'}}>
           <div style={{fontSize: '32px', fontWeight: '900', color: neonGreen, textShadow: `0 0 15px ${neonGreen}44`}}>
             +₹{earnedToday}
           </div>
           <div style={{fontSize: '10px', color: '#666', fontWeight: '800', textTransform: 'uppercase', marginTop: '4px'}}>Earned Today</div>
        </div>
      </div>

      {/* 4. NOTICE BOARD (If Active) */}
      {config.notice_board && (
        <div style={{
          padding: '16px', marginBottom: '24px', borderRadius: '16px',
          background: 'rgba(234, 179, 8, 0.05)', border: '1px solid rgba(234, 179, 8, 0.15)',
          display: 'flex', gap: '12px', alignItems: 'center'
        }}>
          <span style={{fontSize: '18px'}}>⚠️</span>
          <div>
            <div style={{fontSize: '10px', color: '#fbbf24', fontWeight: '800', textTransform: 'uppercase', marginBottom: '2px'}}>Announcement</div>
            <div style={{fontSize: '13px', color: '#ccc', lineHeight: '1.4'}}>{config.notice_board}</div>
          </div>
        </div>
      )}

      {/* 5. QUICK ACCESS (Restored Horizontal Scroll) */}
      <div>
        <h3 style={{fontSize: '11px', color: '#666', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', paddingLeft: '6px', marginBottom: '12px'}}>
          Quick Actions
        </h3>
        
        <div style={{display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px'}}>
           <QuickAction icon="🔥" label="Start Earning" link="/dashboard/campaigns" />
           <QuickAction icon="👑" label="My Empire" link="/dashboard/team" />
           <QuickAction icon="💳" label="Wallet" link="/dashboard/wallet" />
           <QuickAction icon="⚙️" label="Settings" link="/dashboard/profile" />
        </div>
      </div>

    </div>
  );
}

// --- RESTORED HORIZONTAL BUTTON ---
function QuickAction({ icon, label, link }) {
  return (
    <Link href={link} style={{
      minWidth: '100px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
      padding: '16px', borderRadius: '20px',
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
      textDecoration: 'none', backdropFilter: 'blur(10px)'
    }}>
      <div style={{fontSize: '26px'}}>{icon}</div>
      <span style={{fontSize: '11px', color: '#aaa', fontWeight: '700'}}>{label}</span>
    </Link>
  );
}