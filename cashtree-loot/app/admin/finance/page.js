import { supabaseAdmin } from '@/lib/supabaseAdmin';
import WithdrawalRow from './withdrawal-row';

export const revalidate = 0;

export default async function FinancePage() {
  // 1. FETCH PENDING REQUESTS
  const { data: requests, error } = await supabaseAdmin
    .from('withdraw_requests')
    .select(`
      id, amount, status, created_at,
      accounts ( username, full_name, upi_id, phone )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    return <div className="text-red-500 p-10">Error loading finance data.</div>;
  }

  // 2. CALCULATE TOTAL PENDING
  const totalPending = requests?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Finance Control</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Authorize Payouts
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total Pending</div>
          <div className="text-2xl font-mono font-bold text-amber-500">₹{totalPending.toFixed(2)}</div>
        </div>
      </div>

      {/* DATA GRID */}
      <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-[10px] uppercase tracking-widest text-slate-400">
              <th className="p-4 font-bold">Request Date</th>
              <th className="p-4 font-bold">Promoter</th>
              <th className="p-4 font-bold">Banking Details</th>
              <th className="p-4 font-bold text-right">Amount</th>
              <th className="p-4 font-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {requests?.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500 text-sm font-medium">
                  No pending withdrawals.
                </td>
              </tr>
            ) : (
              requests.map((req) => <WithdrawalRow key={req.id} request={req} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}