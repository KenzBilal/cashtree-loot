import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const revalidate = 0; // Disable cache to see real-time stats

export default async function AdminDashboard() {
  // 1. FETCH REAL DATA
  // Count Pending Leads
  const { count: pendingLeads } = await supabaseAdmin
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Count Active Promoters
  const { count: totalPromoters } = await supabaseAdmin
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'promoter');

  // Calculate Liability (Sum of all wallet balances)
  // We sum the 'ledger' table amount.
  const { data: ledgerSum } = await supabaseAdmin
    .from('ledger')
    .select('amount');
  
  const totalLiability = ledgerSum?.reduce((sum, row) => sum + (Number(row.amount) || 0), 0) || 0;

  // 2. RENDER DASHBOARD
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black tracking-tight">System Overview</h1>

      {/* STATS GRID */}
      <div className="grid grid-cols-3 gap-6">
        <StatCard 
          label="Pending Approvals" 
          value={pendingLeads} 
          icon="fa-clock" 
          color="text-yellow-500" 
          borderColor="border-yellow-500/20"
        />
        <StatCard 
          label="Active Partners" 
          value={totalPromoters} 
          icon="fa-users" 
          color="text-blue-500" 
          borderColor="border-blue-500/20"
        />
        <StatCard 
          label="System Liability" 
          value={`₹${totalLiability.toFixed(2)}`} 
          icon="fa-coins" 
          color="text-red-500" 
          borderColor="border-red-500/20"
        />
      </div>

      <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h3>
        <div className="flex gap-4">
           {/* We will build these next */}
           <div className="text-sm text-slate-500">Select a tab from the sidebar to manage the system.</div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, borderColor }) {
  return (
    <div className={`p-6 rounded-2xl bg-[#0a0a0a] border ${borderColor} relative overflow-hidden`}>
      <div className="relative z-10">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</div>
        <div className="text-3xl font-black text-white">{value}</div>
      </div>
      <i className={`fas ${icon} absolute bottom-[-10px] right-[-10px] text-6xl opacity-10 ${color}`}></i>
    </div>
  );
}