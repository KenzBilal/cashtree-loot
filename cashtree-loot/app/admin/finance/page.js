import { createClient } from '@supabase/supabase-js';
import FinanceInterface from './FinanceInterface';
import { markLeadAsPaid, processWithdrawal } from './actions';

export const revalidate = 0;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function FinancePage() {

  // 1. FETCH PENDING PROMOTER WITHDRAWALS
  const { data: withdrawals } = await supabaseAdmin
    .from('withdrawals')
    .select('id, created_at, amount, upi_id, status, account_id, accounts(id, username, phone)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  // 2. FETCH APPROVED LEADS AWAITING PAYMENT
  // FIX: was 'Approved' (capital A) — DB constraint requires lowercase 'approved'
  const { data: payableLeads } = await supabaseAdmin
    .from('leads')
    .select('id, created_at, approved_at, status, payout, user_name, customer_data, campaigns(title)')
    .eq('status', 'approved')
    .order('approved_at', { ascending: true });

  // 3. FETCH BALANCES for all withdrawal accounts to flag insufficient funds
  const withdrawalAccountIds = [...new Set((withdrawals || []).map(w => w.account_id))];
  let balanceMap = {};

  if (withdrawalAccountIds.length > 0) {
    const { data: balances } = await supabaseAdmin
      .from('account_balances')
      .select('account_id, available_balance')
      .in('account_id', withdrawalAccountIds);

    if (balances) {
      balanceMap = Object.fromEntries(balances.map(b => [b.account_id, Number(b.available_balance)]));
    }
  }

  // 4. NORMALIZE & MERGE
  const combinedQueue = [
    ...(withdrawals || []).map(w => {
      const available = balanceMap[w.account_id] ?? 0;
      return {
        id:              w.id,
        type:            'PROMOTER',
        name:            w.accounts?.username || 'Unknown',
        amount:          Number(w.amount),
        method:          'Withdrawal Request',
        details:         w.accounts?.phone || 'N/A',
        upi_id:          w.upi_id,
        date:            w.created_at,
        status:          'pending',
        accountId:       w.account_id,
        // FIX: flag when promoter's balance is less than withdrawal amount
        insufficientFunds: available < Number(w.amount),
        availableBalance:  available,
      };
    }),

    ...(payableLeads || []).map(l => ({
      id:              l.id,
      type:            'USER',
      name:            l.user_name || 'Anonymous User',
      amount:          parseFloat(l.payout) || 0,
      method:          l.campaigns?.title || 'Direct Payout',
      details:         l.customer_data?.phone || 'N/A',
      upi_id:          l.customer_data?.upi || l.customer_data?.upi_id || 'N/A',
      date:            l.approved_at || l.created_at,
      status:          'approved',
      accountId:       null,
      insufficientFunds: false,
      availableBalance:  null,
    })),
  ];

  // 5. STATS
  const totalLiability  = combinedQueue.reduce((sum, i) => sum + (i.amount || 0), 0);
  const promoterCount   = combinedQueue.filter(i => i.type === 'PROMOTER').length;
  const userCount       = combinedQueue.filter(i => i.type === 'USER').length;
  const flaggedCount    = combinedQueue.filter(i => i.insufficientFunds).length;

  const stats = {
    count: combinedQueue.length,
    liability: totalLiability,
    promoterCount,
    userCount,
    flaggedCount,
  };

  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      <FinanceInterface
        queue={combinedQueue}
        stats={stats}
        // FIX: pass as individual props — not bundled in object
        markLeadAsPaid={markLeadAsPaid}
        processWithdrawal={processWithdrawal}
      />
    </div>
  );
}