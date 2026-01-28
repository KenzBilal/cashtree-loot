import { createClient } from '@supabase/supabase-js';
import UserRow from './user-row';

export const revalidate = 0; // Always fresh

// MASTER KEY CLIENT
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function UsersPage() {
  // 1. FETCH PROMOTERS + THEIR TRANSACTIONS (To calc balance)
  const { data: users, error } = await supabaseAdmin
    .from('accounts')
    .select(`
      id, username, full_name, phone, upi_id, is_frozen, created_at, role,
      ledger ( amount )
    `)
    .eq('role', 'promoter')
    .order('created_at', { ascending: false });

  if (error) {
    return <div style={{padding:'40px', color:'#ef4444'}}>Error loading users: {error.message}</div>;
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
          <h1 style={h1Style}>Promoter Roster</h1>
          <p style={subtextStyle}>Manage your army of promoters.</p>
        </div>
        <div style={{background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold'}}>
          TOTAL: {users?.length || 0}
        </div>
      </div>

      {/* DATA GRID */}
      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Identity</th>
              <th style={thStyle}>Contact</th>
              <th style={{...thStyle, textAlign: 'right'}}>Wallet Balance</th>
              <th style={{...thStyle, textAlign: 'center'}}>Status</th>
              <th style={{...thStyle, textAlign: 'center'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? (
              users.map((user) => <UserRow key={user.id} user={user} />)
            ) : (
              <tr>
                <td colSpan="5" style={{padding: '60px', textAlign: 'center', color: '#666'}}>
                  No promoters found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}