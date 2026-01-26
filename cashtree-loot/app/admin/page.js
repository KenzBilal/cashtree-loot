import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export const revalidate = 0; // Always fresh data

// ADMIN CLIENT (Master Key - Bypasses all security rules)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('ct_session')?.value;

  if (!token) redirect('/login');

  // 1. VERIFY ADMIN STATUS
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (!user || authError) redirect('/login');

  const { data: account } = await supabaseAdmin
    .from('accounts')
    .select('role')
    .eq('id', user.id)
    .single();

  if (account?.role !== 'admin') {
    return <div style={{padding:'50px', color:'red'}}>ACCESS DENIED: You are not an Admin.</div>;
  }

  // 2. FETCH ALL DATA
  // Get Pending Leads
  const { data: pendingLeads } = await supabaseAdmin
    .from('leads')
    .select('*, campaigns(title, payout_amount), accounts(username)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  // Get Total Stats
  const { count: totalUsers } = await supabaseAdmin.from('accounts').select('*', { count: 'exact', head: true });
  const { count: totalLeads } = await supabaseAdmin.from('leads').select('*', { count: 'exact', head: true });

  // --- STYLES ---
  const containerStyle = { padding: '40px', maxWidth: '1200px', margin: '0 auto', color: '#fff' };
  const cardStyle = { background: '#111', border: '1px solid #333', borderRadius: '12px', padding: '20px', marginBottom: '20px' };
  const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom:'1px solid #333', paddingBottom:'20px' };
  const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '14px' };
  const thStyle = { textAlign: 'left', padding: '12px', color: '#888', borderBottom: '1px solid #333' };
  const tdStyle = { padding: '12px', borderBottom: '1px solid #222' };
  const badgeStyle = { padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', background: '#f59e0b', color: '#000' };

  return (
    <div style={{minHeight: '100vh', background: '#000', fontFamily: 'sans-serif'}}>
      <div style={containerStyle}>
        
        {/* HEADER */}
        <div style={headerStyle}>
          <h1 style={{margin:0, fontSize:'24px'}}>👑 Admin Panel</h1>
          <div style={{fontSize:'13px', color:'#888'}}>Logged in as {user.email}</div>
        </div>

        {/* STATS ROW */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px'}}>
          <div style={cardStyle}>
            <div style={{fontSize: '12px', color: '#888', textTransform: 'uppercase'}}>Total Users</div>
            <div style={{fontSize: '32px', fontWeight: 'bold'}}>{totalUsers}</div>
          </div>
          <div style={cardStyle}>
            <div style={{fontSize: '12px', color: '#888', textTransform: 'uppercase'}}>Total Leads</div>
            <div style={{fontSize: '32px', fontWeight: 'bold'}}>{totalLeads}</div>
          </div>
        </div>

        {/* PENDING LEADS SECTION */}
        <h2 style={{fontSize:'18px', marginBottom:'15px', color:'#22c55e'}}>Pending Approvals</h2>
        
        <div style={cardStyle}>
          {pendingLeads && pendingLeads.length > 0 ? (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Promoter</th>
                  <th style={thStyle}>Campaign</th>
                  <th style={thStyle}>Customer Phone</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeads.map(lead => (
                  <tr key={lead.id}>
                    <td style={{...tdStyle, fontFamily:'monospace', color:'#555'}}>{lead.id.slice(0,4)}...</td>
                    <td style={tdStyle}>{lead.accounts?.username || 'Unknown'}</td>
                    <td style={tdStyle}>{lead.campaigns?.title} <span style={{color:'#22c55e'}}>(₹{lead.campaigns?.payout_amount})</span></td>
                    <td style={tdStyle}>{lead.metadata?.user_phone}</td>
                    <td style={tdStyle}><span style={badgeStyle}>PENDING</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{padding:'20px', textAlign:'center', color:'#555'}}>No pending leads found.</div>
          )}
        </div>

        <div style={{marginTop: '30px', padding: '15px', background: '#112211', border: '1px solid #14532d', borderRadius: '8px', fontSize: '13px', color: '#4ade80'}}>
          ℹ️ <b>How to Approve:</b> For now, go to your Supabase Database &rarr; <code>leads</code> table &rarr; change status to <code>approved</code>. The promoter's wallet will update automatically!
        </div>

      </div>
    </div>
  );
}