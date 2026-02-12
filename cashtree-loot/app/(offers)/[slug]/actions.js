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
  let redirect_url = formData.get('redirect_url'); // Made mutable (let) so we can modify it
  
  // Inputs for Promoter ID (UUID is safer, Code is fallback)
  const referrer_id_input = formData.get('referrer_id');
  const referral_code = formData.get('referral_code');

  try {
    // 2. FETCH CAMPAIGN (The Source of Truth)
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

    // Default to 'ADMIN_TRAFFIC' if no promoter is found (so you keep the commission)
    const finalSubAffId = promoterId || 'ADMIN_TRAFFIC';

    // 4. CALCULATE THE SPLIT (Server-Side Logic)
    const totalBudget = parseFloat(campaign.payout_amount) || 0;
    let userBonus = parseFloat(campaign.user_reward) || 0;
    
    // If a Promoter exists, check if they have a Custom Split
    if (promoterId) {
      const { data: settings } = await supabase
        .from('promoter_campaign_settings')
        .select('user_bonus')
        .eq('account_id', promoterId)
        .eq('campaign_id', campaign.id)
        .single();

      if (settings) {
        userBonus = parseFloat(settings.user_bonus);
      }
    }

    // The Promoter gets whatever is left from the Total Budget
    let promoterCommission = totalBudget - userBonus;

    // Safety: Never allow negative commission
    if (promoterCommission < 0) promoterCommission = 0;

    // 5. INSERT LEAD & GET ID (Snapshot the Financials)
    // ⚠️ UPDATED: Added .select('id') and .single() to capture the new Lead UUID
    const { data: newLead, error } = await supabase.from('leads').insert({
      campaign_id: campaign_id,
      user_name: user_name,
      customer_data: { upi: upi_id, phone: phone }, 
      referred_by: promoterId,
      status: 'Pending',
      
      // ✅ FINANCE LOGIC:
      payout: promoterCommission, 
      user_bonus: userBonus 
    })
    .select('id')
    .single();

    if (error) {
      console.error("Lead Insert Error:", error);
      return { success: false, error: "Submission failed. Please try again." }; 
    }

    // 6. 🚀 CONSTRUCT THE FINAL TRACKING LINK (The Automation Part)
    
    // Fallback if URL is missing
    let finalUrl = redirect_url && redirect_url !== '#' ? redirect_url : 'https://google.com';

    // A. Inject Promoter ID (Who referred this?)
    if (finalUrl.includes('{replace_it}')) {
      finalUrl = finalUrl.replace(/{replace_it}/g, finalSubAffId);
    } else {
      // If the tag isn't there, append it manually
      const separator = finalUrl.includes('?') ? '&' : '?';
      finalUrl = `${finalUrl}${separator}sub_aff_id=${finalSubAffId}`;
    }

    // B. Inject Lead ID (The Ticket for Postback)
    const separator = finalUrl.includes('?') ? '&' : '?';
    finalUrl = `${finalUrl}${separator}aff_click_id=${newLead.id}`;

    return { 
      success: true, 
      redirectUrl: finalUrl 
    };

  } catch (e) {
    console.error("Critical Submit Error:", e);
    return { success: false, error: e.message };
  }
}