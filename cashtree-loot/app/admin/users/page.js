import { createClient } from '@supabase/supabase-js';
import UsersInterface from './UsersInterface';

export const revalidate = 0;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function UsersPage() {
  const { data: users, error } = await supabaseAdmin
    .from('accounts')
    .select(`
      id, username, full_name, phone, upi_id, is_frozen,
      created_at, role, balance,
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

  // Stats
  const totalUsers     = users?.length || 0;
  const frozenCount    = users?.filter(u => u.is_frozen).length || 0;
  const adminCount     = users?.filter(u => u.role === 'admin').length || 0;
  const totalLiability = users?.reduce((sum, u) => sum + (u.balance || 0), 0) || 0;
  const today          = new Date().toISOString().split('T')[0];
  const newToday       = users?.filter(u => u.created_at?.startsWith(today)).length || 0;

  const stats = { totalUsers, frozenCount, adminCount, totalLiability, newToday };

  return (
    <UsersInterface
      initialUsers={users || []}
      stats={stats}
    />
  );
}