import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// ⚡ FORCE DYNAMIC: Ensure admin always sees fresh data
export const revalidate = 0;

// 🔐 MASTER KEY CLIENT (Bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('ct_session')?.value;

  if (!token) redirect('/login');

  // 1. DATA FETCHING (Parallel for Speed)
  const [
    { count: totalUsers },
    { count: totalLeads },
    { count: pendingCount },
    { data: pendingLeads }
  ] = await Promise.all([
    // A. Count Users
    supabaseAdmin.from('accounts').select('*', { count: 'exact', head: true }),
    
    // B. Count Leads
    supabaseAdmin.from('leads').select('*', { count: 'exact', head: true }),
    
    // C. Count Pending Actions
    supabaseAdmin.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'pending'),

    // D. Get Recent Pending Items (with details)
    supabaseAdmin
      .from('leads')
      .select('*, campaigns(title, payout_amount), accounts(username, phone)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10)
  ]);

  // --- STYLES (Professional Dark UI) ---
  const headerStyle = { marginBottom: '30px' };
  const h1Style = { fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', margin: '0 0 5px 0' };
  const subtextStyle = { color: '#888', fontSize: '14px' };

  // Grid Layout
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
  };

  // Stat Card
  const cardStyle = {
    background: '#0a0a0a',
    border: '1px solid #222',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
  };

  // Table Styles
  const sectionTitleStyle = { fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' };
  const tableCardStyle = { background: '#0a0a0a', border: '1px solid #222', borderRadius: '16px', overflow: 'hidden' };
  const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' };
  const thStyle = { padding: '16px 24px', background: '#111', color: '#888', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' };
  const tdStyle = { padding: '16px 24px', borderBottom: '1px solid #1a1a1a', color: '#e5e5e5' };
  
  // Status Badge
  const badgeStyle = {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '800',
    background: 'rgba(234, 179, 8, 0.1)',
    color: '#facc15', // Yellow for Pending
    border: '1px solid rgba(234, 179, 8, 0.2)'
  };

  return (
    <div>
      {/* 1. HEADER */}
      <div style={headerStyle}>
        <h1 style={h1Style}>Dashboard Overview</h1>
        <p style={subtextStyle}>Welcome back, Admin. Here is what is happening today.</p>
      </div>

      {/* 2. STATS GRID */}
      <div style={gridStyle}>
        {/* Total Users */}
        <div style={cardStyle}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <div>
              <div style={{fontSize: '13px', color: '#888', fontWeight: '600', textTransform: 'uppercase'}}>Total Promoters</div>
              <div style={{fontSize: '36px', fontWeight: '800', color: '#fff', marginTop: '5px'}}>{totalUsers || 0}</div>
            </div>
            <div style={{width: '40px', height: '40px', background: '#111', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'}}>👥</div>
          </div>
        </div>

        {/* Total Leads */}
        <div style={cardStyle}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <div>
              <div style={{fontSize: '13px', color: '#888', fontWeight: '600', textTransform: 'uppercase'}}>Total Leads</div>
              <div style={{fontSize: '36px', fontWeight: '800', color: '#fff', marginTop: '5px'}}>{totalLeads || 0}</div>
            </div>
            <div style={{width: '40px', height: '40px', background: '#111', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'}}>📂</div>
          </div>
        </div>

        {/* Action Required */}
        <div style={{...cardStyle, border: pendingCount > 0 ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid #222'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <div>
              <div style={{fontSize: '13px', color: pendingCount > 0 ? '#facc15' : '#888', fontWeight: '600', textTransform: 'uppercase'}}>Pending Review</div>
              <div style={{fontSize: '36px', fontWeight: '800', color: pendingCount > 0 ? '#facc15' : '#fff', marginTop: '5px'}}>{pendingCount || 0}</div>
            </div>
            <div style={{width: '40px', height: '40px', background: pendingCount > 0 ? 'rgba(234, 179, 8, 0.1)' : '#111', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'}}>🔔</div>
          </div>
        </div>
      </div>

      {/* 3. PENDING APPROVALS TABLE */}
      <h2 style={sectionTitleStyle}>
        <span>Recent Pending Approvals</span>
        {pendingCount > 0 && <span style={{fontSize:'12px', background:'#333', padding:'4px 8px', borderRadius:'10px'}}>{pendingCount} New</span>}
      </h2>

      <div style={tableCardStyle}>
        {pendingLeads && pendingLeads.length > 0 ? (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Promoter</th>
                <th style={thStyle}>Campaign</th>
                <th style={thStyle}>Customer Data</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingLeads.map((lead) => (
                <tr key={lead.id}>
                  {/* Date */}
                  <td style={tdStyle}>
                    <div style={{fontWeight: '600'}}>{new Date(lead.created_at).toLocaleDateString()}</div>
                    <div style={{fontSize: '12px', color: '#666'}}>{new Date(lead.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </td>
                  
                  {/* Promoter */}
                  <td style={tdStyle}>
                    <div style={{color: '#fff', fontWeight: '500'}}>{lead.accounts?.username}</div>
                    <div style={{fontSize: '12px', color: '#666'}}>{lead.accounts?.phone || 'No Phone'}</div>
                  </td>
                  
                  {/* Campaign */}
                  <td style={tdStyle}>
                    <div style={{color: '#fff'}}>{lead.campaigns?.title}</div>
                    <div style={{color: '#22c55e', fontSize: '12px', fontWeight: 'bold'}}>Payout: ₹{lead.campaigns?.payout_amount}</div>
                  </td>

                  {/* Customer Data */}
                  <td style={tdStyle}>
                    <code style={{background: '#1a1a1a', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#a3a3a3'}}>
                      {lead.metadata?.user_phone || "N/A"}
                    </code>
                  </td>

                  {/* Status / Link */}
                  <td style={tdStyle}>
                    <span style={badgeStyle}>PENDING</span>
                    {/* In a future update, we can add a real "Approve" button here */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{padding: '60px', textAlign: 'center'}}>
            <div style={{fontSize: '40px', marginBottom: '10px', opacity: 0.3}}>✅</div>
            <h3 style={{color: '#fff', margin: 0}}>All Caught Up!</h3>
            <p style={{color: '#666', fontSize: '14px', marginTop: '5px'}}>No pending leads to review right now.</p>
          </div>
        )}
        
        {/* Footer of Table */}
        {pendingLeads && pendingLeads.length > 0 && (
          <div style={{padding: '16px', background: '#111', borderTop: '1px solid #222', textAlign: 'center'}}>
            <Link href="/admin/leads" style={{color: '#22c55e', fontSize: '13px', fontWeight: '600', textDecoration: 'none'}}>View All Approvals →</Link>
          </div>
        )}
      </div>

    </div>
  );
}