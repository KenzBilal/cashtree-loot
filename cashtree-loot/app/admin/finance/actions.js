'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/requireAdmin';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── 1. PAY A USER (Direct Lead Payout) ──
export async function markLeadAsPaid(leadId) {
  await requireAdmin();

  try {
    const { error } = await supabaseAdmin
      .from('leads')
      .update({ status: 'Paid' })
      .eq('id', leadId);

    if (error) throw new Error(error.message);

    revalidatePath('/admin/finance');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ── 2. PROCESS PROMOTER WITHDRAWAL (With Refund Logic) ──
export async function processWithdrawal(payoutId, action, amount, userId) {
  await requireAdmin();

  try {
    // A. Update Status
    const { error: updateError } = await supabaseAdmin
      .from('withdrawals')
      .update({ status: action }) // 'paid' or 'rejected'
      .eq('id', payoutId);

    if (updateError) throw new Error(updateError.message);

    // B. If Rejected -> Refund the User
    /*if (action === 'rejected' && userId) {
      const { error: refundError } = await supabaseAdmin
        .from('ledger')
        .insert({
          account_id: userId,
          amount: amount,
          type: 'legacy_migration',
          description: `Refund: Withdrawal Rejected`
        });

      if (refundError) {
        console.error("Refund Error:", refundError);
        throw new Error("Failed to refund user ledger.");
      }
    }*/

    revalidatePath('/admin/finance');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}