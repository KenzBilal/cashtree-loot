'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function savePayoutSettings(campaignId, userBonus, promoterShare) {
  try {
    // 1. GET AUTHENTICATED USER
    const cookieStore = await cookies();
    const token = cookieStore.get('ct_session')?.value;
    
    if (!token) return { success: false, error: "Unauthorized" };

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // 2. FETCH CAMPAIGN LIMIT (Source of Truth)
    const { data: campaign, error: campError } = await supabaseAdmin
      .from('campaigns')
      .select('payout_amount')
      .eq('id', campaignId)
      .single();

    if (campError || !campaign) return { success: false, error: "Campaign not found" };

    // 3. SECURITY CHECK (Server-Side Math)
    // Ensure the new split doesn't exceed the Admin's Total Limit
    const proposedTotal = parseFloat(userBonus) + parseFloat(promoterShare);
    const maxLimit = parseFloat(campaign.payout_amount);

    // Allow a tiny margin for floating point errors (0.01)
    if (proposedTotal > maxLimit + 0.01) {
      return { success: false, error: `Limit exceeded! Max allowed is ₹${maxLimit}` };
    }

    // 4. UPSERT SETTINGS
    // "Upsert" means: If settings exist, update them. If not, create new row.
    const { error } = await supabaseAdmin
      .from('promoter_campaign_settings')
      .upsert({
        account_id: user.id,
        campaign_id: campaignId,
        user_bonus: parseFloat(userBonus),
        promoter_share: parseFloat(promoterShare),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'account_id, campaign_id' // Uses the Unique Constraint we set in DB
      });

    if (error) {
      console.error("Save Error:", error);
      return { success: false, error: "Failed to save settings." };
    }

    // 5. REFRESH UI
    revalidatePath('/dashboard/campaigns');
    return { success: true };

  } catch (e) {
    console.error("Critical Error:", e);
    return { success: false, error: e.message };
  }
}