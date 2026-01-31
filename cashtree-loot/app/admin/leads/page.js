import { createClient } from '@supabase/supabase-js';
import LeadsInterface from './LeadsInterface';
import { updateLeadStatus } from './actions'; // ✅ Import from the new file

export const revalidate = 0;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function LeadsPage() {
  // 1. FETCH DATA
  const { data: leads, error } = await supabaseAdmin
    .from('leads')
    .select(`
      *,
      campaigns ( title, icon_url ),
      accounts ( username, phone )
    `) 
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    return <div className="p-10 text-red-500">Error: {error.message}</div>;
  }

  // 2. CALCULATE STATS
  const stats = {
    pendingCount: leads.filter(l => l.status === 'Pending').length,
    approvedCount: leads.filter(l => l.status === 'Approved').length,
    rejectedCount: leads.filter(l => l.status === 'Rejected').length,
    pendingValue: leads
      .filter(l => l.status === 'Pending')
      .reduce((sum, l) => sum + (parseFloat(l.payout) || 0), 0)
  };

  return (
    <LeadsInterface 
      initialData={leads || []} 
      stats={stats} 
      updateStatusAction={updateLeadStatus} // ✅ Pass the robust action
    />
  );
}