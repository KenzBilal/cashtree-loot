import { createClient } from '@supabase/supabase-js';
import LeadsInterface from './LeadsInterface';

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
      campaigns ( title, payout_amount, icon_url ),
      accounts ( id, username, phone )
    `)
    .order('created_at', { ascending: false })
    .limit(500); // Higher limit for analytics

  if (error) return <div style={{padding:'40px', color:'#ef4444'}}>Error: {error.message}</div>;

  // 2. CALCULATE INTELLIGENCE
  const pending = leads.filter(l => l.status === 'pending');
  const approved = leads.filter(l => l.status === 'approved');
  
  const stats = {
    pendingCount: pending.length,
    approvedCount: approved.length,
    rejectedCount: leads.filter(l => l.status === 'rejected').length,
    // Calculate potential payout liability
    pendingValue: pending.reduce((sum, l) => sum + (l.campaigns?.payout_amount || 0), 0)
  };

  return (
    <div style={{animation: 'fadeIn 0.6s ease-out'}}>
      <LeadsInterface initialData={leads || []} stats={stats} />
    </div>
  );
}