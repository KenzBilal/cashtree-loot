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

    // 1. FETCH LEAD DETAILS FIRST
    // We need to know who referred it and how much it is worth
    const { data: lead, error: fetchError } = await supabaseAdmin
      .from('leads')
      .select('id, referred_by, payout, status, user_name, campaigns(title)')
      .eq('id', leadId)
      .single();

    if (fetchError || !lead) throw new Error("Lead not found.");

    // 2. COMMISSION LOGIC (Only runs when Approving for the first time)
    // We check if it is being Approved AND has a Promoter
    if (newStatus === 'Approved' && lead.status !== 'Approved' && lead.referred_by) {
      
      const commission = parseFloat(lead.payout) || 0;
      
      if (commission > 0) {
        console.log(`💰 Paying ₹${commission} to Promoter ${lead.referred_by}`);

        // A. Add to Ledger (History)
        const { error: ledgerError } = await supabaseAdmin
          .from('ledger')
          .insert({
            account_id: lead.referred_by,
            type: 'credit',
            amount: commission,
            description: `Commission: ${lead.user_name} (${lead.campaigns?.title || 'Lead'})`
          });

        if (ledgerError) throw new Error("Failed to create ledger entry: " + ledgerError.message);

        // B. Update Wallet Balance (The Money)
        // We use a Remote Procedure Call (RPC) or direct increment if you have a simple setup.
        // Assuming you have a 'balance' or 'wallet_balance' column. I will use the safest method:
        
        // Fetch current balance
        const { data: promoter } = await supabaseAdmin
          .from('accounts')
          .select('balance')
          .eq('id', lead.referred_by)
          .single();

        const currentBalance = promoter?.balance || 0;
        const newBalance = currentBalance + commission;

        // Save new balance
        const { error: balanceError } = await supabaseAdmin
          .from('accounts')
          .update({ balance: newBalance })
          .eq('id', lead.referred_by);

        if (balanceError) throw new Error("Failed to update wallet balance.");
      }
    }

    // 3. UPDATE LEAD STATUS (Final Step)
    const updates = {
      status: newStatus,
      // If approving, set the timestamp
      approved_at: newStatus === 'Approved' ? new Date().toISOString() : null
    };

    const { error: updateError } = await supabaseAdmin
      .from('leads')
      .update(updates)
      .eq('id', leadId);

    if (updateError) throw updateError;

    // 4. REFRESH EVERYTHING
    revalidatePath('/admin/leads');
    revalidatePath('/admin/finance');
    revalidatePath('/admin');
    
    return { success: true };

  } catch (e) {
    console.error("❌ Action Error:", e);
    return { success: false, error: e.message };
  }
}