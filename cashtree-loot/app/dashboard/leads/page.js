import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export const revalidate = 0; // Always fresh data

export default async function LeadsPage() {
  // 1. GET AUTH TOKEN (The Fix)
  const cookieStore = await cookies();
  const token = cookieStore.get('ct_session')?.value;

  // If no token, redirect to login immediately
  if (!token) redirect('/login');

  // 2. CONNECT TO SUPABASE WITH TOKEN
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  // 3. AUTH CHECK
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect('/login');

  // 4. FETCH LEADS (Robust)
  // We use 'referred_by' because that matches your database table
  const { data: leads, error } = await supabase
    .from('leads')
    .select(`
      id, created_at, status, payout,
      campaigns ( title ),
      users ( phone )
    `)
    .eq('referred_by', user.id) 
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return (
      <div style={{padding: '40px', textAlign: 'center', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', background: 'rgba(239,68,68,0.1)'}}>
        Error loading activity log. <br/>
        <small style={{fontSize:'10px', opacity:0.7}}>{error.message}</small>
      </div>
    );
  }

  // --- PREMIUM STYLES ---
  const headerStyle = { 
    marginBottom: '30px',
    textAlign: 'center'
  };

  const neonTitle = {
    fontSize: '24px', 
    fontWeight: '900', 
    color: '#fff', 
    marginBottom: '8px',
    textShadow: '0 0 15px rgba(255,255,255,0.2)'
  };
  
  return (
    <div className="fade-in" style={{paddingBottom: '100px'}}>
      {/* HEADER */}
      <div style={headerStyle}>
        <h1 style={neonTitle}>Activity Log</h1>
        <p style={{
          color: '#888', 
          fontSize: '11px', 
          fontWeight: '700', 
          textTransform: 'uppercase', 
          letterSpacing: '1px',
          background: 'rgba(255,255,255,0.05)',
          display: 'inline-block',
          padding: '6px 12px',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          Track your referrals & payouts
        </p>
      </div>

      {/* LEAD LIST */}
      <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
        {leads && leads.length > 0 ? (
          leads.map((lead) => <LeadItem key={lead.id} lead={lead} />)
        ) : (
          <div style={{
            padding: '60px 20px', 
            textAlign: 'center', 
            border: '1px dashed rgba(255,255,255,0.1)', 
            borderRadius: '24px', 
            background: 'rgba(255,255,255,0.02)'
          }}>
            <div style={{fontSize: '40px', marginBottom: '10px', filter: 'grayscale(100%) opacity(0.5)'}}>📂</div>
            <div style={{color: '#fff', fontWeight: 'bold', fontSize: '16px', marginBottom: '6px'}}>No activity yet</div>
            <div style={{color: '#666', fontSize: '12px'}}>Share a campaign to get your first lead!</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// COMPONENT: SINGLE LEAD ITEM (GLASS EDITION)
// ---------------------------------------------------------
function LeadItem({ lead }) {
  // 1. CONFIG: Colors & Shadows
  const statusConfig = {
    paid:     { 
      icon: '✓', 
      color: '#00ff88', // Neon Green
      bg: 'rgba(0, 255, 136, 0.1)', 
      border: 'rgba(0, 255, 136, 0.3)',
      shadow: '0 0 15px rgba(0, 255, 136, 0.1)'
    }, 
    approved: { 
      icon: '✓', 
      color: '#00ff88', 
      bg: 'rgba(0, 255, 136, 0.1)', 
      border: 'rgba(0, 255, 136, 0.3)',
      shadow: '0 0 15px rgba(0, 255, 136, 0.1)'
    },
    pending:  { 
      icon: '◷', 
      color: '#facc15', // Neon Yellow
      bg: 'rgba(250, 204, 21, 0.1)', 
      border: 'rgba(250, 204, 21, 0.3)',
      shadow: '0 0 15px rgba(250, 204, 21, 0.1)'
    },
    rejected: { 
      icon: '✕', 
      color: '#f87171', // Neon Red
      bg: 'rgba(248, 113, 113, 0.1)', 
      border: 'rgba(248, 113, 113, 0.3)',
      shadow: 'none'
    }
  };

  const config = statusConfig[lead.status] || statusConfig.pending;

  // 2. MASK PHONE
  const rawPhone = lead.users?.phone || 'Unknown';
  const maskedPhone = rawPhone.length > 6 
    ? rawPhone.slice(0, 3) + '****' + rawPhone.slice(-3) 
    : '****';

  // 3. FORMAT DATE
  const dateStr = new Date(lead.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short'
  });

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px',
      borderRadius: '20px',
      background: 'rgba(255, 255, 255, 0.03)', // Glass
      backdropFilter: 'blur(10px)',
      border: `1px solid ${config.border}`,
      boxShadow: config.shadow,
      transition: 'transform 0.2s',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* GLOW EFFECT BEHIND ICON */}
      <div style={{
        position: 'absolute', top: '20px', left: '20px', 
        width: '30px', height: '30px', 
        background: config.color, filter: 'blur(20px)', opacity: 0.2
      }}></div>

      {/* ICON BADGE */}
      <div style={{
        width: '42px', height: '42px', borderRadius: '50%', 
        background: config.bg, color: config.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px', fontWeight: '900', flexShrink: 0,
        zIndex: 2, border: `1px solid ${config.border}`
      }}>
        {config.icon}
      </div>

      {/* INFO */}
      <div style={{flex: 1, minWidth: 0, zIndex: 2}}>
        <div style={{
          fontSize: '15px', fontWeight: '800', color: '#fff', 
          marginBottom: '4px', whiteSpace: 'nowrap', 
          overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
          {lead.campaigns?.title || 'Unknown Campaign'}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#888'}}>
          <span style={{fontFamily: 'monospace', color: '#aaa', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px'}}>{maskedPhone}</span>
          <span>•</span>
          <span>{dateStr}</span>
        </div>
      </div>

      {/* PAYOUT / STATUS */}
      <div style={{textAlign: 'right', zIndex: 2}}>
        <div style={{color: '#fff', fontWeight: '900', fontSize: '15px', textShadow: '0 0 10px rgba(0,0,0,0.5)'}}>
          {lead.payout > 0 ? `+₹${lead.payout}` : '₹0'}
        </div>
        <div style={{
          fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', 
          color: config.color, marginTop: '4px', letterSpacing: '1px'
        }}>
          {lead.status}
        </div>
      </div>

    </div>
  );
}