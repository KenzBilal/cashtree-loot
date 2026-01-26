import { createClient } from '@supabase/supabase-js';
import LeadRow from './lead-row';

export const revalidate = 0; // Always fresh data

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function LeadsPage() {
  // 1. FETCH LEADS WITH RELATIONS
  // We join 'campaigns' to get the title/price
  // We join 'accounts' to get the promoter's name
  const { data: leads, error } = await supabaseAdmin
    .from('leads')
    .select(`
      *,
      campaigns ( title, payout_amount ),
      accounts ( id, username, phone )
    `)
    .order('created_at', { ascending: false })
    .limit(100); // Limit to last 100 for speed

  if (error) {
    return <div style={{padding:'40px', color:'#ef4444'}}>Error loading leads: {error.message}</div>;
  }

  // --- STYLES ---
  const headerStyle = { marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'end' };
  const h1Style = { fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', margin: '0 0 5px 0' };
  const subtextStyle = { color: '#888', fontSize: '14px' };
  
  const tableContainerStyle = { background: '#0a0a0a', border: '1px solid #222', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' };
  const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' };
  const thStyle = { padding: '16px 24px', background: '#111', color: '#666', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #222' };

  return (
    <div>
      {/* HEADER */}
      <div style={headerStyle}>
        <div>
          <h1 style={h1Style}>Lead Approvals</h1>
          <p style={subtextStyle}>Review and approve customer submissions.</p>
        </div>
        <div style={{background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold'}}>
          TOTAL: {leads?.length || 0}
        </div>
      </div>

      {/* DATA GRID */}
      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID / Date</th>
              <th style={thStyle}>Campaign</th>
              <th style={thStyle}>Promoter</th>
              <th style={thStyle}>Customer Data</th>
              <th style={thStyle}>Status / Action</th>
            </tr>
          </thead>
          <tbody>
            {leads && leads.length > 0 ? (
              leads.map((lead) => <LeadRow key={lead.id} lead={lead} />)
            ) : (
              <tr>
                <td colSpan="5" style={{padding: '60px', textAlign: 'center', color: '#666'}}>
                  No leads found yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}