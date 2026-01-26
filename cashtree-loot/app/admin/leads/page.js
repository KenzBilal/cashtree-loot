import { supabaseAdmin } from '@/lib/supabaseAdmin';
import LeadRow from './lead-row'; 

export const revalidate = 0; // Force real-time data

export default async function LeadsPage() {
  // 1. FETCH PENDING LEADS (Join with Campaign & Promoter info)
  const { data: leads, error } = await supabaseAdmin
    .from('leads')
    .select(`
      id, created_at, status, is_first_approved,
      campaigns ( title, payout_amount ),
      accounts ( username, full_name )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching leads:", error);
    return <div className="text-red-500 p-10">Error loading leads. Check console.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Lead Approvals</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Verify work before paying
          </p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-2 rounded-lg text-xs font-bold">
          <i className="fas fa-clock mr-2"></i>
          PENDING: {leads?.length || 0}
        </div>
      </div>

      {/* DATA GRID */}
      <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-[10px] uppercase tracking-widest text-slate-400">
              <th className="p-4 font-bold">Date</th>
              <th className="p-4 font-bold">Campaign</th>
              <th className="p-4 font-bold">Promoter</th>
              <th className="p-4 font-bold text-right">Payout</th>
              <th className="p-4 font-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {leads?.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500 text-sm font-medium">
                  All caught up! No pending leads.
                </td>
              </tr>
            ) : (
              leads.map((lead) => <LeadRow key={lead.id} lead={lead} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}