import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { CheckCircle, Clock, XCircle, ClipboardList } from 'lucide-react';

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

  // 2. FETCH LEADS
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
        padding: '24px', borderRadius: '16px', textAlign: 'center',
        background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
        color: '#f87171', fontSize: '13px', fontWeight: '700',
      }}>
        Could not load activity log. Please refresh.
      </div>
    );
  }

  // 3. STATS
  const totalEarned   = leads?.filter(l => ['Approved','paid'].includes(l.status))
    .reduce((sum, l) => sum + (parseFloat(l.payout) || 0), 0) || 0;
  const approvedCount = leads?.filter(l => ['Approved','paid'].includes(l.status)).length || 0;
  const pendingCount  = leads?.filter(l => l.status === 'Pending').length || 0;

  const NEON  = '#00ff88';
  const glass = {
    background: 'rgba(8,8,12,0.8)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
  };

  return (
    <div style={{ paddingBottom: '100px' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lead-row { transition: background 0.18s; }
        .lead-row:hover { background: rgba(255,255,255,0.025) !important; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: '28px', animation: 'fadeUp 0.4s ease both' }}>
        <div style={{
          fontSize: '10px', color: NEON, fontWeight: '800',
          textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px',
          display: 'flex', alignItems: 'center', gap: '7px',
        }}>
          <ClipboardList size={12} color={NEON} />
          Activity Log
        </div>
        <h1 style={{
          fontSize: 'clamp(22px,4vw,30px)', fontWeight: '900', color: '#fff',
          margin: 0, letterSpacing: '-0.8px',
        }}>
          Your Referrals
        </h1>
        <p style={{ color: '#444', fontSize: '12px', fontWeight: '600', margin: '6px 0 0', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Last 50 leads · live tracking
        </p>
      </div>

      {/* ── STATS ROW ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
        gap: '10px', marginBottom: '24px',
        animation: 'fadeUp 0.4s ease 0.08s both',
      }}>
        {[
          { label: 'Total Earned', value: `₹${totalEarned.toLocaleString('en-IN')}`, color: NEON },
          { label: 'Approved',     value: approvedCount,                               color: NEON },
          { label: 'Pending',      value: pendingCount,                                color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ ...glass, padding: '16px', textAlign: 'center' }}>
            <div style={{
              fontSize: 'clamp(18px,4vw,22px)', fontWeight: '900',
              color, marginBottom: '5px', letterSpacing: '-0.5px',
            }}>
              {value}
            </div>
            <div style={{ fontSize: '9px', color: '#444', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── LEAD LIST ── */}
      {leads && leads.length > 0 ? (
        <div style={{
          ...glass,
          overflow: 'hidden',
          animation: 'fadeUp 0.4s ease 0.14s both',
        }}>
          {leads.map((lead, i) => (
            <LeadRow key={lead.id} lead={lead} index={i} isLast={i === leads.length - 1} />
          ))}
        </div>
      ) : (
        <div style={{
          ...glass,
          padding: '60px 20px', textAlign: 'center',
          animation: 'fadeUp 0.4s ease 0.14s both',
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <ClipboardList size={24} color="#333" />
          </div>
          <div style={{ color: '#fff', fontWeight: '800', fontSize: '15px', marginBottom: '6px' }}>
            No activity yet
          </div>
          <div style={{ color: '#444', fontSize: '12px', fontWeight: '600' }}>
            Share a campaign link to get your first lead
          </div>
        </div>
      )}
    </div>
  );
}

// ── LEAD ROW ──
function LeadRow({ lead, index, isLast }) {
  const STATUS = {
    paid:     { color: '#00ff88', icon: <CheckCircle size={15} color="#00ff88" />, label: 'Paid' },
    Approved: { color: '#00ff88', icon: <CheckCircle size={15} color="#00ff88" />, label: 'Approved' },
    Pending:  { color: '#fbbf24', icon: <Clock size={15} color="#fbbf24" />,       label: 'Pending' },
    Rejected: { color: '#ef4444', icon: <XCircle size={15} color="#ef4444" />,     label: 'Rejected' },
  };

  const s     = STATUS[lead.status] || STATUS.Pending;
  const phone = lead.customer_data?.phone || null;
  const name  = lead.user_name || 'Unknown';
  const date  = new Date(lead.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: '2-digit',
  });

  return (
    <div
      className="lead-row"
      style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '15px 18px',
        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
        background: 'transparent',
        animation: `fadeUp 0.3s ease ${Math.min(index * 30, 250)}ms both`,
      }}
    >
      {/* Status icon box */}
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
        background: `${s.color}0d`,
        border: `1px solid ${s.color}2a`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {s.icon}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '13px', fontWeight: '700', color: '#fff',
          marginBottom: '4px', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {lead.campaigns?.title || 'Unknown Campaign'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: '#555', fontWeight: '600' }}>
            {name}
          </span>
          {phone && (
            <>
              <span style={{ color: '#222', fontSize: '10px' }}>·</span>
              <span style={{ fontSize: '11px', color: '#444', fontFamily: 'monospace', fontWeight: '600' }}>
                {phone}
              </span>
            </>
          )}
          <span style={{ color: '#222', fontSize: '10px' }}>·</span>
          <span style={{ fontSize: '11px', color: '#333', fontWeight: '600' }}>{date}</span>
        </div>
      </div>

      {/* Right: payout + status */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: '900', color: parseFloat(lead.payout) > 0 ? '#00ff88' : '#555', marginBottom: '3px' }}>
          {parseFloat(lead.payout) > 0 ? `+₹${lead.payout}` : '₹0'}
        </div>
        <div style={{
          fontSize: '9px', fontWeight: '800', textTransform: 'uppercase',
          letterSpacing: '0.6px', color: s.color, opacity: 0.7,
        }}>
          {s.label}
        </div>
      </div>
    </div>
  );
}