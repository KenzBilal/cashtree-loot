import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export const revalidate = 60;

export default async function LeadsPage() {
  // 1. AUTH
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

  // 2. FETCH LEADS — includes user_name and customer_data for full phone
  const { data: leads, error } = await supabase
    .from('leads')
    .select(`
      id, created_at, status, payout, user_name, customer_data,
      campaigns ( title )
    `)
    .eq('referred_by', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return (
      <div style={{
        padding: '40px', textAlign: 'center', color: '#f87171',
        border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px',
        background: 'rgba(239,68,68,0.1)'
      }}>
        Error loading activity log.<br/>
        <small style={{ fontSize: '10px', opacity: 0.7 }}>{error.message}</small>
      </div>
    );
  }

  // 3. STATS
  const totalEarned = leads?.filter(l => l.status === 'Approved' || l.status === 'paid')
    .reduce((sum, l) => sum + (parseFloat(l.payout) || 0), 0) || 0;
  const pendingCount = leads?.filter(l => l.status === 'Pending').length || 0;
  const approvedCount = leads?.filter(l => l.status === 'Approved' || l.status === 'paid').length || 0;

  return (
    <div style={{ paddingBottom: '100px' }}>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lead-card { transition: transform 0.2s, box-shadow 0.2s; }
        .lead-card:hover { transform: translateY(-2px); }
      `}</style>

      {/* HEADER */}
      <div style={{ marginBottom: '32px', textAlign: 'center', animation: 'fadeUp 0.4s ease both' }}>
        <h1 style={{
          fontSize: '26px', fontWeight: '900', color: '#fff',
          marginBottom: '8px', letterSpacing: '-0.5px'
        }}>
          Activity Log
        </h1>
        <span style={{
          color: '#888', fontSize: '11px', fontWeight: '700',
          textTransform: 'uppercase', letterSpacing: '1px',
          background: 'rgba(255,255,255,0.05)',
          padding: '6px 14px', borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'inline-block'
        }}>
          Track your referrals & payouts
        </span>
      </div>

      {/* STATS ROW */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px', marginBottom: '28px',
        animation: 'fadeUp 0.4s ease 0.1s both'
      }}>
        {[
          { label: 'Total Earned', value: `₹${totalEarned.toLocaleString()}`, color: '#00ff88' },
          { label: 'Approved',     value: approvedCount,                       color: '#00ff88' },
          { label: 'Pending',      value: pendingCount,                        color: '#facc15' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px', padding: '16px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: '900', color, marginBottom: '4px' }}>
              {value}
            </div>
            <div style={{ fontSize: '10px', color: '#555', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* LEAD LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {leads && leads.length > 0 ? (
          leads.map((lead, i) => (
            <LeadItem key={lead.id} lead={lead} index={i} />
          ))
        ) : (
          <div style={{
            padding: '60px 20px', textAlign: 'center',
            border: '1px dashed rgba(255,255,255,0.08)',
            borderRadius: '24px', background: 'rgba(255,255,255,0.02)'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.3 }}>📂</div>
            <div style={{ color: '#fff', fontWeight: '800', fontSize: '15px', marginBottom: '6px' }}>
              No activity yet
            </div>
            <div style={{ color: '#555', fontSize: '12px' }}>
              Share a campaign link to get your first lead!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// LEAD ITEM COMPONENT
// ---------------------------------------------------------
function LeadItem({ lead, index }) {
  const statusConfig = {
    paid:     { color: '#00ff88', bg: 'rgba(0,255,136,0.08)',   border: 'rgba(0,255,136,0.2)',   icon: '✓' },
    Approved: { color: '#00ff88', bg: 'rgba(0,255,136,0.08)',   border: 'rgba(0,255,136,0.2)',   icon: '✓' },
    Pending:  { color: '#facc15', bg: 'rgba(250,204,21,0.08)',  border: 'rgba(250,204,21,0.2)',  icon: '◷' },
    Rejected: { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', icon: '✕' },
  };

  const config = statusConfig[lead.status] || statusConfig.Pending;

  // Pull phone directly from customer_data (where it's actually stored)
  const phone = lead.customer_data?.phone || '—';
  const name  = lead.user_name || 'Unknown';

  const dateStr = new Date(lead.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <div
      className="lead-card"
      style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '16px 18px', borderRadius: '18px',
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${config.border}`,
        position: 'relative', overflow: 'hidden',
        animation: `fadeUp 0.35s ease ${Math.min(index * 40, 300)}ms both`,
      }}
    >
      {/* BG GLOW */}
      <div style={{
        position: 'absolute', top: '16px', left: '16px',
        width: '28px', height: '28px',
        background: config.color, filter: 'blur(18px)', opacity: 0.15,
        pointerEvents: 'none'
      }} />

      {/* STATUS ICON */}
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
        background: config.bg, border: `1px solid ${config.border}`,
        color: config.color, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '16px', fontWeight: '900', zIndex: 1
      }}>
        {config.icon}
      </div>

      {/* INFO */}
      <div style={{ flex: 1, minWidth: 0, zIndex: 1 }}>
        {/* Campaign title */}
        <div style={{
          fontSize: '14px', fontWeight: '800', color: '#fff',
          marginBottom: '5px', whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
          {lead.campaigns?.title || 'Unknown Campaign'}
        </div>

        {/* Name + Phone + Date */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
          <span style={{
            color: '#ccc', fontWeight: '700',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '2px 8px', borderRadius: '6px'
          }}>
            👤 {name}
          </span>
          <span style={{
            color: '#00ff88', fontWeight: '700', fontFamily: 'monospace',
            background: 'rgba(0,255,136,0.06)',
            border: '1px solid rgba(0,255,136,0.15)',
            padding: '2px 8px', borderRadius: '6px'
          }}>
            📞 {phone}
          </span>
          <span style={{ color: '#444' }}>•</span>
          <span style={{ color: '#555' }}>{dateStr}</span>
        </div>
      </div>

      {/* PAYOUT */}
      <div style={{ textAlign: 'right', zIndex: 1, flexShrink: 0 }}>
        <div style={{
          color: config.color, fontWeight: '900', fontSize: '16px',
          marginBottom: '3px'
        }}>
          {parseFloat(lead.payout) > 0 ? `+₹${lead.payout}` : '₹0'}
        </div>
        <div style={{
          fontSize: '9px', fontWeight: '900', textTransform: 'uppercase',
          color: config.color, letterSpacing: '0.8px', opacity: 0.7
        }}>
          {lead.status}
        </div>
      </div>
    </div>
  );
}