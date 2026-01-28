import { createClient } from '@supabase/supabase-js';
import FinanceInterface from './FinanceInterface';

export const revalidate = 0;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function FinancePage() {
  // 1. FETCH ALL DATA
  const { data: withdrawals, error } = await supabaseAdmin
    .from('withdrawals')
    .select(`*, accounts ( id, username, phone )`)
    .order('created_at', { ascending: false });

  if (error) return <div style={{padding:'40px', color:'#ef4444'}}>Error: {error.message}</div>;

  // 2. CALCULATE FINANCIAL INTELLIGENCE
  const pendingRequests = withdrawals.filter(w => w.status === 'pending');
  const totalPending = pendingRequests.reduce((sum, w) => sum + (w.amount || 0), 0);
  
  const paidRequests = withdrawals.filter(w => w.status === 'paid');
  const totalPaid = paidRequests.reduce((sum, w) => sum + (w.amount || 0), 0);

  const stats = {
    pendingCount: pendingRequests.length,
    pendingAmount: totalPending,
    totalPaid: totalPaid,
    totalTx: withdrawals.length
  };

  // --- STYLES ---
  const containerStyle = { animation: 'fadeIn 0.6s ease-out' };

  return (
    <div style={containerStyle}>
      <FinanceInterface 
        initialData={withdrawals || []} 
        stats={stats} 
      />
    </div>
  );
}