import { supabaseAdmin } from '@/lib/supabaseAdmin';
import UserRow from './user-row';

export const revalidate = 0;

export default async function UsersPage() {
  // 1. FETCH ALL ACCOUNTS (Promoters only usually, but let's get all)
  const { data: users, error } = await supabaseAdmin
    .from('accounts')
    .select(`
      id, username, full_name, phone, upi_id, is_frozen, created_at, role,
      ledger ( amount )
    `)
    .eq('role', 'promoter') // Filter to show only promoters
    .order('created_at', { ascending: false });

  if (error) return <div className="text-red-500">Error loading users.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Promoter Roster</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Manage your army
          </p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-500 px-4 py-2 rounded-lg text-xs font-bold">
          <i className="fas fa-users mr-2"></i>
          TOTAL: {users?.length || 0}
        </div>
      </div>

      {/* DATA GRID */}
      <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-[10px] uppercase tracking-widest text-slate-400">
              <th className="p-4 font-bold">Identity</th>
              <th className="p-4 font-bold">Contact</th>
              <th className="p-4 font-bold text-right">Wallet Balance</th>
              <th className="p-4 font-bold text-center">Status</th>
              <th className="p-4 font-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users?.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500 text-sm font-medium">
                  No promoters found.
                </td>
              </tr>
            ) : (
              users.map((user) => <UserRow key={user.id} user={user} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}