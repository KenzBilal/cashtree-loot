'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

/**
 * DATABASE INITIALIZATION
 * Uses the Service Role Key to bypass RLS for administrative ledger credits.
 */
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * PROCESS LEAD
 * 10/10 Logic: Updates lead status and injects funds into the promoter's ledger.
 * * @param {string} leadId - The unique ID of the customer lead.
 * @param {string} status - 'approved' or 'rejected'.
 * @param {number} payoutAmount - The reward amount defined by the campaign.
 * @param {string} userId - The UUID of the promoter who earned the lead.
 * @param {string} campaignTitle - Title for the ledger description.
 */
export async function processLead(leadId, status, payoutAmount, userId, campaignTitle) {
  try {
    // 1. DATA VALIDATION
    if (!['approved', 'rejected'].includes(status)) {
      throw new Error("Invalid status transition.");
    }

    // 2. STATUS UPDATE
    // We update the lead first to "lock" it from being processed twice.
    const { data: updatedLead, error: updateError } = await supabaseAdmin
      .from('leads')
      .update({ 
        status: status,
        processed_at: new Date().toISOString() 
      })
      .eq('id', leadId)
      .eq('status', 'pending') // STRICT: Only allow processing if currently pending
      .select();

    if (updateError) throw new Error(`Database Error: ${updateError.message}`);
    if (!updatedLead || updatedLead.length === 0) {
      throw new Error("Lead already processed or not found.");
    }

    // 3. LEDGER INJECTION (Only on Approval)
    if (status === 'approved') {
      const { error: ledgerError } = await supabaseAdmin
        .from('ledger')
        .insert({
          account_id: userId,
          amount: payoutAmount,
          type: 'credit', // 'credit' adds money to the wallet balance
          category: 'EARNING',
          description: `Reward: Approved lead for "${campaignTitle}"`
        });

      if (ledgerError) {
        // NOTE: In a 10/10 system, if ledger fails, you'd want to roll back the lead status.
        // For now, we alert the admin to check consistency.
        console.error("CRITICAL: Lead approved but Ledger failed!", ledgerError);
        throw new Error("Lead status updated, but payment injection failed. Manual fix required.");
      }
    }

    // 4. SYSTEM LOGGING (Audit Trail)
    // Optional: If you have an audit_logs table, record the admin action here.
    await supabaseAdmin.from('audit_logs').insert({
      action: `LEAD_${status.toUpperCase()}`,
      actor_role: 'admin',
      target_type: 'lead',
      target_id: leadId,
      metadata: { payoutAmount, campaignTitle, userId }
    });

    // 5. CACHE REVALIDATION
    // This tells Next.js to dump the old list and fetch the fresh status immediately.
    revalidatePath('/admin/leads');
    revalidatePath('/admin/finance'); // Revalidate finance in case it affects liability stats

    return { success: true };

  } catch (error) {
    console.error("ACTION_ERROR:", error.message);
    throw new Error(error.message);
  }
}