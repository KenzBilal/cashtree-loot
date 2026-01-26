'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function updateLeadStatus(leadId, newStatus, payoutAmount, promoterId) {
  // 1. UPDATE THE LEAD STATUS
  const { error: updateError } = await supabaseAdmin
    .from('leads')
    .update({ status: newStatus })
    .eq('id', leadId);

  if (updateError) throw new Error(updateError.message);

  // 2. IF APPROVED -> ADD MONEY TO WALLET (Create Ledger Entry)
  // We only do this if the status is changing to 'approved'
  if (newStatus === 'approved') {
    const { error: ledgerError } = await supabaseAdmin
      .from('ledger')
      .insert({
        account_id: promoterId,
        amount: payoutAmount,
        type: 'credit',
        description: `Lead Approved (ID: ${leadId.slice(0,4)})`
      });

    if (ledgerError) console.error("Failed to pay user:", ledgerError);
  }

  // 3. REFRESH PAGE
  revalidatePath('/admin/leads');
}