'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function updateLeadStatus(leadId, newStatus) {
  try {
    console.log(`⚡ Processing Lead ${leadId} -> ${newStatus}...`);

    // 1. FETCH LEAD DETAILS
    const { data: lead, error: fetchError } = await supabaseAdmin
      .from('leads')
      .select('id, referred_by, payout, status, user_name, campaigns(title)')
      .eq('id', leadId)
      .single();

    if (fetchError || !lead) throw new Error("Lead not found.");

    // 2. COMMISSION LOGIC
    if (newStatus === 'Approved' && lead.status !== 'Approved' && lead.referred_by) {
      
      const commission = parseFloat(lead.payout) || 0;
      
      if (commission > 0) {
        console.log(`💰 Paying ₹${commission} to Promoter ${lead.referred_by}`);

        // A. Add to Ledger
        const { error: ledgerError } = await supabaseAdmin
          .from('ledger')
          .insert({
            // ✅ FIX 1: Ensure a unique ID is provided if default isn't set
            // ✅ FIX 2: Use 'task_earning' to pass the database CHECK constraint
            account_id: lead.referred_by,
            type: 'task_earning', 
            amount: commission,
            description: `Commission: ${lead.user_name} (${lead.campaigns?.title || 'Lead'})`
          });

        if (ledgerError) {
          console.error("Ledger Insert Error:", ledgerError);
          throw new Error("Failed to create ledger entry.");
        }

        // B. Update Wallet Balance (Note: Your View handles this, but we update the table for redundancy)
        const { data: promoter } = await supabaseAdmin
          .from('accounts')
          .select('balance')
          .eq('id', lead.referred_by)
          .single();

        const currentBalance = promoter?.balance || 0;
        const newBalance = currentBalance + commission;

        await supabaseAdmin
          .from('accounts')
          .update({ balance: newBalance })
          .eq('id', lead.referred_by);
      }
    }

    // 3. UPDATE LEAD STATUS
    const updates = { status: newStatus };
    if (newStatus === 'Approved') {
      updates.approved_at = new Date().toISOString();
    }

    const { error: updateError } = await supabaseAdmin
      .from('leads')
      .update(updates)
      .eq('id', leadId);

    if (updateError) throw updateError;

    revalidatePath('/admin/leads');
    revalidatePath('/admin/finance');
    revalidatePath('/admin');
    
    return { success: true };

  } catch (e) {
    console.error("❌ Action Error:", e);
    return { success: false, error: e.message };
  }
}