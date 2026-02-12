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
  // We treat the URL as a "Template" now
  let urlTemplate = formData.get('redirect_url'); 
  
  const referrer_id_input = formData.get('referrer_id');
  const referral_code = formData.get('referral_code');

  try {
    // 2. FETCH CAMPAIGN DATA
    const { data: campaign, error: campError } = await supabase
      .from('campaigns')
      .select('id, payout_amount, user_reward') 
      .eq('id', campaign_id)
      .single();

    if (campError || !campaign) throw new Error("Invalid Campaign ID");

    // 3. RESOLVE PROMOTER IDENTITY
    let promoterId = referrer_id_input || null;

    if (!promoterId && referral_code) {
      const { data: promoter } = await supabase
        .from('accounts') 
        .select('id')
        .eq('username', referral_code.trim().toUpperCase()) 
        .single();
      if (promoter) promoterId = promoter.id;
    }

    // Default to 'ADMIN_TRAFFIC' if no promoter (you keep the profit)
    const finalSubAffId = promoterId || 'ADMIN_TRAFFIC';

    // 4. CALCULATE FINANCIAL SPLIT
    const totalBudget = parseFloat(campaign.payout_amount) || 0;
    let userBonus = parseFloat(campaign.user_reward) || 0;
    
    if (promoterId) {
      const { data: settings } = await supabase
        .from('promoter_campaign_settings')
        .select('user_bonus')
        .eq('account_id', promoterId)
        .eq('campaign_id', campaign.id)
        .single();

      if (settings) userBonus = parseFloat(settings.user_bonus);
    }

    let promoterCommission = totalBudget - userBonus;
    if (promoterCommission < 0) promoterCommission = 0;

    // 5. INSERT LEAD & GET ID (The "Ticket Number")
    const { data: newLead, error } = await supabase.from('leads').insert({
      campaign_id: campaign_id,
      user_name: user_name,
      customer_data: { upi: upi_id, phone: phone }, 
      referred_by: promoterId,
      status: 'Pending',
      payout: promoterCommission, 
      user_bonus: userBonus 
    })
    .select('id')
    .single();

    if (error) {
      console.error("Lead Insert Error:", error);
      return { success: false, error: "Submission failed. Please try again." }; 
    }

    // ---------------------------------------------------------
    // 🚀 6. SMART URL CONSTRUCTION (The Magic Part)
    // ---------------------------------------------------------
    
    // Fallback: If DB has no link, go to Google (prevents crash)
    let finalUrl = urlTemplate && urlTemplate !== '#' ? urlTemplate : 'https://google.com';

    // A. HANDLE THE LEAD ID (aff_click_id)
    // If the link already has the placeholder 'aff_click_id={replace_it}', swap it perfectly.
    if (finalUrl.includes('aff_click_id={replace_it}')) {
      finalUrl = finalUrl.replace('aff_click_id={replace_it}', `aff_click_id=${newLead.id}`);
    } 
    // If the link does NOT have it (e.g. CreditCode), we append it safely.
    else if (!finalUrl.includes('aff_click_id=')) {
      const separator = finalUrl.includes('?') ? '&' : '?';
      finalUrl = `${finalUrl}${separator}aff_click_id=${newLead.id}`;
    }

    // B. HANDLE THE PROMOTER ID (sub_aff_id)
    // If the link has 'sub_aff_id={replace_it}', swap it perfectly.
    if (finalUrl.includes('sub_aff_id={replace_it}')) {
      finalUrl = finalUrl.replace('sub_aff_id={replace_it}', `sub_aff_id=${finalSubAffId}`);
    } 
    // If not, append it.
    else if (!finalUrl.includes('sub_aff_id=')) {
      const separator = finalUrl.includes('?') ? '&' : '?';
      finalUrl = `${finalUrl}${separator}sub_aff_id=${finalSubAffId}`;
    }

    // C. CLEANUP (Just in case)
    // If there are any other stray '{replace_it}' tags left, replace them with Promoter ID
    finalUrl = finalUrl.replace(/{replace_it}/g, finalSubAffId);

    return { 
      success: true, 
      redirectUrl: finalUrl 
    };

  } catch (e) {
    console.error("Critical Submit Error:", e);
    return { success: false, error: e.message };
  }
}