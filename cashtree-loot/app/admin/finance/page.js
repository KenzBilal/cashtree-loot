import { createClient } from '@supabase/supabase-js';
import FinanceInterface from './FinanceInterface';
import { markLeadAsPaid, processWithdrawal } from './actions';

export const revalidate = 0;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function FinancePage() {
  // 1. FETCH PROMOTER WITHDRAWALS (Pending)
  const { data: withdrawals } = await supabaseAdmin
    .from('withdrawals')
    .select(`*, accounts ( id, username, phone )`)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  // 2. FETCH APPROVED LEADS (Users - Direct Payout)
  const { data: payableLeads } = await supabaseAdmin
    .from('leads')
    .select(`*, campaigns(title)`)
    .eq('status', 'Approved') // Matches your DB Capitalization
    .order('approved_at', { ascending: true });

  // 3. NORMALIZE & MERGE DATA
  const combinedQueue = [
    // A. Promoter Requests
    ...(withdrawals || []).map(w => ({
      id: w.id,
      type: 'PROMOTER',
      name: w.accounts?.username || 'Unknown',
      amount: w.amount,
      method: 'Withdrawal Request',
      details: w.accounts?.phone || 'N/A',
      upi_id: w.upi_id, // Keep specific field for Copy function
      date: w.created_at,
      status: 'pending',
      accountId: w.accounts?.id // Needed for refunds
    })),
    // B. User Leads
    ...(payableLeads || []).map(l => ({
      id: l.id,
      type: 'USER',
      name: l.user_name || 'Anonymous User',
      amount: parseFloat(l.payout),
      method: 'Direct Payout',
      details: l.customer_data?.phone || 'N/A',
      upi_id: l.customer_data?.upi || 'N/A',
      date: l.approved_at || l.created_at,
      status: 'Approved', // Treated as pending for payment
      accountId: null
    }))
  ];

  // 4. CALCULATE STATS
  const totalLiability = combinedQueue.reduce((sum, item) => sum + (item.amount || 0), 0);
  const promoterCount = combinedQueue.filter(i => i.type === 'PROMOTER').length;
  const userCount = combinedQueue.filter(i => i.type === 'USER').length;

  const stats = {
    count: combinedQueue.length,
    liability: totalLiability,
    promoterCount,
    userCount
  };

  const containerStyle = { animation: 'fadeIn 0.6s ease-out' };

  return (
    <div style={containerStyle}>
      <FinanceInterface 
        queue={combinedQueue} 
        stats={stats} 
        actions={{ markLeadAsPaid, processWithdrawal }}
      />
    </div>
  );
}