import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export const revalidate = 0; // Always fresh data

export default async function LeadsPage() {
  // 1. GET TOKEN & AUTH CLIENT
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

  // 2. FETCH LEADS (My Referrals)
  // We join 'campaigns' to get the Task Name and 'users' (the lead) to get their phone.
  // Note: 'promoter_id' is the column in 'leads' table that links to the promoter.
  const { data: leads, error } = await supabase
    .from('leads')
    .select(`
      id, created_at, status, payout,
      campaigns ( title ),
      users ( phone )
    `)
    .eq('promoter_id', user.id) // Ensure we filter by promoter_id
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return <div style={{padding: '40px', color: '#ef4444', textAlign: 'center'}}>Error loading activity log.</div>;
  }

  // --- STYLES ---
  const headerStyle = { marginBottom: '30px' };
  
  return (
    <div>
      {/* HEADER */}
      <div style={headerStyle}>
        <h1 style={{fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '8px'}}>Activity Log</h1>
        <p style={{color: '#666', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px'}}>
          Track your referrals & payouts
        </p>
      </div>

      {/* LEAD LIST */}
      <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
        {leads && leads.length > 0 ? (
          leads.map((lead) => <LeadItem key={lead.id} lead={lead} />)
        ) : (
          <div style={{
            padding: '40px', 
            textAlign: 'center', 
            border: '1px dashed #333', 
            borderRadius: '16px', 
            background: '#0a0a0a'
          }}>
            <div style={{fontSize: '30px', marginBottom: '10px'}}>📂</div>
            <div style={{color: '#fff', fontWeight: 'bold', fontSize: '14px'}}>No activity found</div>
            <div style={{color: '#666', fontSize: '12px', marginTop: '4px'}}>Share a campaign to get your first lead!</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// COMPONENT: SINGLE LEAD ITEM
// ---------------------------------------------------------
function LeadItem({ lead }) {
  // 1. CONFIG: Colors based on status
  const statusConfig = {
    paid:     { icon: '✓', color: '#4ade80', bg: 'rgba(34, 197, 94, 0.1)', border: '#14532d' }, // approved/paid
    approved: { icon: '✓', color: '#4ade80', bg: 'rgba(34, 197, 94, 0.1)', border: '#14532d' },
    pending:  { icon: '◷', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: '#78350f' },
    rejected: { icon: '✕', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: '#7f1d1d' }
  };

  const config = statusConfig[lead.status] || statusConfig.pending;

  // 2. MASK PHONE (Privacy)
  // Turns "9876543210" into "987****210"
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
      borderRadius: '16px',
      background: '#0a0a0a',
      border: `1px solid ${config.border}` // Dynamic border color
    }}>
      
      {/* ICON BADGE */}
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%', 
        background: config.bg, color: config.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px', fontWeight: 'bold', flexShrink: 0
      }}>
        {config.icon}
      </div>

      {/* INFO */}
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
          {lead.campaigns?.title || 'Unknown Campaign'}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#666'}}>
          <span style={{fontFamily: 'monospace', color: '#888'}}>{maskedPhone}</span>
          <span>•</span>
          <span>{dateStr}</span>
        </div>
      </div>

      {/* PAYOUT / STATUS */}
      <div style={{textAlign: 'right'}}>
        <div style={{color: '#fff', fontWeight: '800', fontSize: '14px'}}>
          {lead.payout > 0 ? `+₹${lead.payout}` : '₹0'}
        </div>
        <div style={{
          fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', 
          color: config.color, marginTop: '2px', letterSpacing: '0.5px'
        }}>
          {lead.status}
        </div>
      </div>

    </div>
  );
}