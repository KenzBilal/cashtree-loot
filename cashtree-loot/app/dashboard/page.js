import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// ⚡ Force fresh data on every load
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function DashboardPage() {
  // 1. AUTH CHECK
  const { data: { user } } = await supabase.auth.getUser();

  // If loading user fails or takes time, show the premium skeleton
  if (!user) return <DashboardSkeleton />;

  // 2. PARALLEL DATA FETCHING (Fastest method)
  // We fire all 3 requests at the exact same millisecond
  const accountReq = supabase.from('accounts').select('username, ledger(amount)').eq('id', user.id).single();
  const configReq = supabase.from('system_config').select('notice_board').eq('id', 1).single();
  const leadsReq = supabase.from('leads').select('*', { count: 'exact', head: true }).eq('referred_by', user.id);

  const [accountRes, configRes, leadsRes] = await Promise.all([accountReq, configReq, leadsReq]);

  // 3. SAFE DATA PARSING
  const account = accountRes.data || { username: 'Promoter', ledger: [] };
  const config = configRes.data || {};
  const leadCount = leadsRes.count || 0;
  
  // Calculate Balance safely
  const balance = account.ledger?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

  // --- PREMIUM GLASS STYLES ---
  const glassCard = {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
  };

  const neonText = {
    color: '#fff',
    textShadow: '0 0 20px rgba(34, 197, 94, 0.6)', // Green Glow
    fontWeight: '900'
  };

  return (
    <div className="fade-in" style={{paddingBottom: '20px'}}>
      
      {/* HEADER */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
        <div>
          <div style={{fontSize: '11px', color: '#00ff88', letterSpacing: '2px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px'}}>Dashboard</div>
          <div style={{fontSize: '24px', fontWeight: 'bold', color: '#fff'}}>Hi, {account.username}</div>
        </div>
        <div style={{
          width: '45px', height: '45px', borderRadius: '50%', 
          background: 'linear-gradient(135deg, #00ff88, #00b36b)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)', 
          color: '#000', fontSize: '20px', border: '2px solid #fff'
        }}>👤</div>
      </div>

      {/* BALANCE CARD (HERO) */}
      <div style={{
        ...glassCard, 
        background: 'linear-gradient(145deg, rgba(20,20,20,0.8) 0%, rgba(0,0,0,0.9) 100%)', 
        border: '1px solid rgba(0, 255, 136, 0.2)', 
        marginBottom: '24px', position: 'relative', overflow: 'hidden'
      }}>
        {/* Abstract Glow Background */}
        <div style={{position: 'absolute', top: '-50%', right: '-50%', width: '250px', height: '250px', background: '#00ff88', filter: 'blur(120px)', opacity: 0.15}}></div>
        
        <div style={{fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700'}}>Total Balance</div>
        <div style={{fontSize: '46px', ...neonText, margin: '12px 0', fontFamily: 'sans-serif'}}>
          ₹{balance.toLocaleString()}
        </div>
        
        <div style={{display: 'flex', gap: '12px', marginTop: '24px'}}>
          <Link href="/dashboard/wallet" style={{
            flex: 1, padding: '14px', background: '#00ff88', color: '#000', 
            borderRadius: '14px', textAlign: 'center', fontWeight: '800', textDecoration: 'none', fontSize: '14px',
            boxShadow: '0 0 15px rgba(0,255,136,0.3)'
          }}>
            Withdraw Money
          </Link>
          <Link href="/dashboard/leads" style={{
            flex: 1, padding: '14px', background: 'rgba(255,255,255,0.05)', color: '#fff', 
            borderRadius: '14px', textAlign: 'center', fontWeight: '700', textDecoration: 'none', fontSize: '14px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            History
          </Link>
        </div>
      </div>

      {/* NOTICE BOARD */}
      {config.notice_board && (
        <div style={{...glassCard, borderLeft: '3px solid #eab308', padding: '20px', marginBottom: '24px', background: 'rgba(234, 179, 8, 0.05)'}}>
          <div style={{color: '#eab308', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '1px'}}>📢 Announcement</div>
          <p style={{color: '#ddd', fontSize: '14px', lineHeight: '1.6'}}>{config.notice_board}</p>
        </div>
      )}

      {/* STATS GRID */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
        <div style={{...glassCard, padding: '24px', textAlign: 'center'}}>
          <div style={{fontSize: '32px', fontWeight: '800', color: '#fff'}}>{leadCount}</div>
          <div style={{fontSize: '10px', color: '#666', textTransform: 'uppercase', fontWeight: 'bold', marginTop: '6px', letterSpacing: '0.5px'}}>Total Leads</div>
        </div>
        <div style={{...glassCard, padding: '24px', textAlign: 'center'}}>
          <div style={{fontSize: '32px', fontWeight: '800', color: '#00ff88'}}>Active</div>
          <div style={{fontSize: '10px', color: '#666', textTransform: 'uppercase', fontWeight: 'bold', marginTop: '6px', letterSpacing: '0.5px'}}>Account Status</div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// PREMIUM SKELETON LOADER (Shows while fetching data)
// ------------------------------------------------------------------
function DashboardSkeleton() {
  const shimmer = {
    background: 'linear-gradient(90deg, #111 0%, #222 50%, #111 100%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '12px'
  };

  return (
    <div style={{paddingBottom: '20px'}}>
      {/* Header Skeleton */}
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '30px'}}>
        <div>
          <div style={{...shimmer, width: '80px', height: '14px', marginBottom: '8px'}}></div>
          <div style={{...shimmer, width: '150px', height: '28px'}}></div>
        </div>
        <div style={{...shimmer, width: '45px', height: '45px', borderRadius: '50%'}}></div>
      </div>

      {/* Card Skeleton */}
      <div style={{...shimmer, width: '100%', height: '220px', borderRadius: '24px', marginBottom: '24px'}}></div>

      {/* Grid Skeleton */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
        <div style={{...shimmer, height: '120px', borderRadius: '24px'}}></div>
        <div style={{...shimmer, height: '120px', borderRadius: '24px'}}></div>
      </div>

      {/* CSS Animation for Shimmer */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}