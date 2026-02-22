'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/requireAdmin';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── 1. MARK LEAD AS PAID ──
export async function markLeadAsPaid(leadId) {
  const admin = await requireAdmin();

  try {
    // FIX: was 'Paid' (capital P) — DB constraint requires lowercase 'paid'
    const { data: lead, error: fetchError } = await supabaseAdmin
      .from('leads')
      .select('id, status, payout, referred_by, user_name')
      .eq('id', leadId)
      .single();

    if (fetchError) throw new Error(fetchError.message);
    if (!lead) throw new Error('Lead not found.');
    if (lead.status !== 'approved') throw new Error(`Lead is not approved (status: ${lead.status}).`);

    const { error } = await supabaseAdmin
      .from('leads')
      .update({ status: 'paid' })  // FIX: lowercase
      .eq('id', leadId);

    if (error) throw new Error(error.message);

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      actor_id:    admin.id,
      actor_role:  'admin',
      action:      'approve_lead',
      target_type: 'leads',
      target_id:   leadId,
      metadata:    { payout: lead.payout, user_name: lead.user_name },
    });

    revalidatePath('/admin/finance');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ── 2. PROCESS PROMOTER WITHDRAWAL ──
export async function processWithdrawal(withdrawalId, action) {
  const admin = await requireAdmin();

  // action must be 'paid' or 'rejected'
  if (!['paid', 'rejected'].includes(action)) {
    return { success: false, error: 'Invalid action.' };
  }

  try {
    // Fetch the withdrawal to validate it + get amount/account
    const { data: withdrawal, error: fetchError } = await supabaseAdmin
      .from('withdrawals')
      .select('id, status, amount, account_id, upi_id')
      .eq('id', withdrawalId)
      .single();

    if (fetchError) throw new Error(fetchError.message);
    if (!withdrawal) throw new Error('Withdrawal not found.');
    if (withdrawal.status !== 'pending') {
      throw new Error(`Withdrawal is already ${withdrawal.status}.`);
    }

    // FIX: If approving, verify the promoter still has sufficient balance
    if (action === 'paid') {
      const { data: balRow } = await supabaseAdmin
        .from('account_balances')
        .select('available_balance')
        .eq('account_id', withdrawal.account_id)
        .single();

      const available = balRow?.available_balance ?? 0;
      if (available < withdrawal.amount) {
        throw new Error(`Insufficient balance. Available: ₹${available}, Requested: ₹${withdrawal.amount}`);
      }

      // FIX: Deduct from ledger — was never done before, promoters could get paid multiple times
      const { error: ledgerError } = await supabaseAdmin
        .from('ledger')
        .insert({
          account_id:  withdrawal.account_id,
          amount:      -withdrawal.amount,  // negative = deduction
          type:        'promoter_payout',
          reference_id: withdrawalId,
          description: 'Withdrawal Processed',
        });

      if (ledgerError) throw new Error(`Ledger deduction failed: ${ledgerError.message}`);
    }

    // FIX: If rejecting, refund the amount back to the ledger
    if (action === 'rejected') {
      const { error: refundError } = await supabaseAdmin
        .from('ledger')
        .insert({
          account_id:  withdrawal.account_id,
          amount:      withdrawal.amount,   // positive = refund
          type:        'refund',
          reference_id: withdrawalId,
          description: 'Refund: Withdrawal Rejected',
        });

      if (refundError) throw new Error(`Refund failed: ${refundError.message}`);
    }

    // FIX: Update status + set processed_at (was never set before)
    const { error: updateError } = await supabaseAdmin
      .from('withdrawals')
      .update({
        status:       action,
        processed_at: new Date().toISOString(),
      })
      .eq('id', withdrawalId);

    if (updateError) throw new Error(updateError.message);

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      actor_id:    admin.id,
      actor_role:  'admin',
      action:      action === 'paid' ? 'approve_withdrawal' : 'reject_withdrawal',
      target_type: 'withdrawals',
      target_id:   withdrawalId,
      metadata:    { amount: withdrawal.amount, upi_id: withdrawal.upi_id, account_id: withdrawal.account_id },
    });

    revalidatePath('/admin/finance');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}