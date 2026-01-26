import { createClient } from '@supabase/supabase-js';
import PayoutRow from './payout-row';

export const revalidate = 0; // Always fresh

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function FinancePage() {
  // FETCH WITHDRAWALS
  const { data: withdrawals, error } = await supabaseAdmin
    .from('withdrawals')
    .select(`
      *,
      accounts ( id, username, phone )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return <div style={{padding:'40px', color:'#ef4444'}}>Error loading finance data: {error.message}</div>;
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
          <h1 style={h1Style}>Payout Requests</h1>
          <p style={subtextStyle}>Approve withdrawals and send money.</p>
        </div>
        <div style={{background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', color: '#facc15', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold'}}>
          PENDING: {withdrawals?.filter(w => w.status === 'pending').length || 0}
        </div>
      </div>

      {/* DATA GRID */}
      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Promoter</th>
              <th style={thStyle}>Amount & UPI</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals && withdrawals.length > 0 ? (
              withdrawals.map((item) => <PayoutRow key={item.id} item={item} />)
            ) : (
              <tr>
                <td colSpan="4" style={{padding: '60px', textAlign: 'center', color: '#666'}}>
                  No payout requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}