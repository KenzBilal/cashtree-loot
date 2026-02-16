import { createClient } from '@supabase/supabase-js';
import LeadsInterface from './LeadsInterface';
import { updateLeadStatus } from './actions'; 

export const revalidate = 0;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function LeadsPage() {
  const { data: leads, error } = await supabaseAdmin
    .from('leads')
    .select(`*, campaigns(title), accounts(username, phone)`) 
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    return <div style={{padding: '40px', color: '#ef4444', background: '#000'}}>Error: {error.message}</div>;
  }

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
      updateStatusAction={updateLeadStatus} 
    />
  );
}