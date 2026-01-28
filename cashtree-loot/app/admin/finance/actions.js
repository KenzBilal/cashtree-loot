'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Admin Client to bypass RLS (Row Level Security)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function processPayout(payoutId, action, amount, userId) {
  // action = 'paid' or 'rejected'

  // 1. UPDATE WITHDRAWAL REQUEST STATUS
  const { error: updateError } = await supabaseAdmin
    .from('withdrawals')
    .update({ status: action })
    .eq('id', payoutId);

  if (updateError) throw new Error(updateError.message);

  // 2. IF REJECTED -> REFUND THE USER
  // When they requested withdraw, we deducted money. If we reject, we must add it back.
  if (action === 'rejected') {
    const { error: refundError } = await supabaseAdmin
      .from('ledger')
      .insert({
        account_id: userId,
        amount: amount, // Positive amount adds back to wallet
        type: 'credit',
        description: `Refund: Withdrawal Rejected`
      });

    if (refundError) throw new Error("Failed to refund user.");
  }

  // 3. REFRESH PAGE DATA
  revalidatePath('/admin/finance');
}