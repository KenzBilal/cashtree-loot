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
      created_at, role,
      account_balances ( available_balance ),
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

  const formattedUsers = users?.map(u => ({
    ...u,
    balance: Number(u.account_balances?.available_balance ?? 0),
  })) || [];

  const totalUsers  = formattedUsers.length;
  const frozenCount = formattedUsers.filter(u => u.is_frozen).length;
  const adminCount  = formattedUsers.filter(u => u.role === 'admin').length;
  const activeCount = formattedUsers.filter(u => !u.is_frozen && u.role !== 'admin').length;
  const totalLiability = formattedUsers.reduce((sum, u) => sum + u.balance, 0);

  // FIX: IST-aware today check
  const nowIST   = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const todayIST = nowIST.toISOString().split('T')[0];
  const newToday = formattedUsers.filter(u => u.created_at?.startsWith(todayIST)).length;

  const stats = { totalUsers, frozenCount, adminCount, activeCount, totalLiability, newToday };

  return <UsersInterface initialUsers={formattedUsers} stats={stats} />;
}