'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function submitLead(formData) {
  // 1. EXTRACT DATA
  const campaign_id = formData.get('campaign_id');
  const user_name = formData.get('user_name');
  const upi_id = formData.get('upi_id');
  const phone = formData.get('phone');
  const redirect_url = formData.get('redirect_url');
  
  // Inputs for Promoter ID (UUID is safer, Code is fallback)
  const referrer_id_input = formData.get('referrer_id');
  const referral_code = formData.get('referral_code');

  try {
    // 2. FETCH CAMPAIGN (The Source of Truth)
    // We need the 'payout_amount' (Total Budget) and 'user_reward' (Default User Share)
    const { data: campaign, error: campError } = await supabase
      .from('campaigns')
      .select('id, payout_amount, user_reward') 
      .eq('id', campaign_id)
      .single();

    if (campError || !campaign) throw new Error("Invalid Campaign ID");

    // 3. RESOLVE PROMOTER IDENTITY
    let promoterId = referrer_id_input || null;

    // If no UUID was passed, try to find ID from the Code (Legacy Support)
    if (!promoterId && referral_code) {
      const { data: promoter } = await supabase
        .from('accounts') 
        .select('id')
        .eq('username', referral_code.trim().toUpperCase()) 
        .single();
      if (promoter) promoterId = promoter.id;
    }

    // 4. CALCULATE THE SPLIT (Server-Side Logic)
    // Start with Default: User gets standard reward, Promoter gets the rest
    const totalBudget = parseFloat(campaign.payout_amount) || 0;
    let userBonus = parseFloat(campaign.user_reward) || 0;
    
    // If a Promoter exists, check if they have a Custom Split
    if (promoterId) {
      const { data: settings } = await supabase
        .from('promoter_campaign_settings')
        .select('user_bonus') // We only need to know what they promised the user
        .eq('account_id', promoterId)
        .eq('campaign_id', campaign.id)
        .single();

      if (settings) {
        userBonus = parseFloat(settings.user_bonus);
      }
    }

    // The Promoter gets whatever is left from the Total Budget
    let promoterCommission = totalBudget - userBonus;

    // Safety: Never allow negative commission (e.g., if User Bonus > Budget)
    if (promoterCommission < 0) promoterCommission = 0;

    // 5. INSERT LEAD (Snapshot the Financials)
    const { error } = await supabase.from('leads').insert({
      campaign_id: campaign_id,
      user_name: user_name,
      customer_data: { upi: upi_id, phone: phone }, 
      referred_by: promoterId,
      status: 'Pending',
      
      // ✅ FINANCE LOGIC:
      // 'payout': The amount the PROMOTER earns (used by Admin/Wallet)
      payout: promoterCommission, 
      
      // 'user_bonus': The amount the USER earns (used for display/trust)
      user_bonus: userBonus 
    });

    if (error) {
      console.error("Lead Insert Error:", error);
      return { success: false, error: "Submission failed. Please try again." }; 
    }

    return { 
      success: true, 
      redirectUrl: redirect_url && redirect_url !== '#' ? redirect_url : 'https://google.com' 
    };

  } catch (e) {
    console.error("Critical Submit Error:", e);
    return { success: false, error: e.message };
  }
}