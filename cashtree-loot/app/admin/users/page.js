import { createClient } from '@supabase/supabase-js';
import UsersInterface from './UsersInterface';

export const revalidate = 0;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function UsersPage() {
  // 1. Removed 'balance' from this query
  const { data: users, error } = await supabaseAdmin
    .from('accounts')
    .select(`
      id, username, full_name, phone, upi_id, is_frozen,
      created_at, role,
      ledger ( amount, created_at, type, description ),
      leads!leads_referred_by_fkey ( id )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div style={{ padding: '40px', color: '#ef4444', fontSize: '14px' }}>
        Error loading users: {error.message}
      </div>
    );
  }

  // 2. Calculate balance dynamically from their ledger records
  const formattedUsers = users?.map(u => ({
    ...u,
    balance: u.ledger?.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0) || 0
  })) || [];

  // Stats
  const totalUsers     = formattedUsers.length;
  const frozenCount    = formattedUsers.filter(u => u.is_frozen).length;
  const adminCount     = formattedUsers.filter(u => u.role === 'admin').length;
  const totalLiability = formattedUsers.reduce((sum, u) => sum + u.balance, 0);
  const today          = new Date().toISOString().split('T')[0];
  const newToday       = formattedUsers.filter(u => u.created_at?.startsWith(today)).length;

  const stats = { totalUsers, frozenCount, adminCount, totalLiability, newToday };

  return (
    <UsersInterface
      initialUsers={formattedUsers}
      stats={stats}
    />
  );
}