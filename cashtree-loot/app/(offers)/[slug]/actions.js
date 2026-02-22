'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function submitLead(formData) {
  const campaign_id    = formData.get('campaign_id');
  const user_name      = formData.get('user_name');
  const upi_id         = formData.get('upi_id');
  const phone          = formData.get('phone');
  let   urlTemplate    = formData.get('redirect_url');
  const referrer_id_input = formData.get('referrer_id');
  const referral_code  = formData.get('referral_code');

  try {
    // 1. FETCH CAMPAIGN
    const { data: campaign, error: campError } = await supabase
      .from('campaigns')
      .select('id, payout_amount, user_reward')
      .eq('id', campaign_id)
      .single();

    if (campError || !campaign) throw new Error('Invalid Campaign ID');

    // 2. RESOLVE PROMOTER
    let promoterId = referrer_id_input || null;

    if (!promoterId && referral_code) {
      const { data: promoter } = await supabase
        .from('accounts')
        .select('id')
        .eq('username', referral_code.trim().toUpperCase())
        .single();
      if (promoter) promoterId = promoter.id;
    }

    const finalSubAffId = promoterId || 'ADMIN_TRAFFIC';

    // 3. CALCULATE SPLIT
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

    // 4. INSERT LEAD
    // ✅ FIX: status must be lowercase to match DB constraint
    // DB constraint: status = ANY (ARRAY['pending','approved','rejected','paid'])
    const { data: newLead, error } = await supabase
      .from('leads')
      .insert({
        campaign_id,
        user_name,
        customer_data: { upi: upi_id, phone },
        referred_by:   promoterId,
        status:        'pending',   // ✅ was 'Pending' — caused every insert to fail
        payout:        promoterCommission,
        user_bonus:    userBonus,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[submitLead] Insert error:', error);
      return { success: false, error: 'Submission failed. Please try again.' };
    }

    // 5. BUILD REDIRECT URL
    let finalUrl = urlTemplate && urlTemplate !== '#'
      ? urlTemplate
      : 'https://google.com';

    // Swap aff_click_id placeholder or append
    if (finalUrl.includes('aff_click_id={replace_it}')) {
      finalUrl = finalUrl.replace('aff_click_id={replace_it}', `aff_click_id=${newLead.id}`);
    } else if (!finalUrl.includes('aff_click_id=')) {
      const sep = finalUrl.includes('?') ? '&' : '?';
      finalUrl = `${finalUrl}${sep}aff_click_id=${newLead.id}`;
    }

    // Swap sub_aff_id placeholder or append
    if (finalUrl.includes('sub_aff_id={replace_it}')) {
      finalUrl = finalUrl.replace('sub_aff_id={replace_it}', `sub_aff_id=${finalSubAffId}`);
    } else if (!finalUrl.includes('sub_aff_id=')) {
      const sep = finalUrl.includes('?') ? '&' : '?';
      finalUrl = `${finalUrl}${sep}sub_aff_id=${finalSubAffId}`;
    }

    // Cleanup any remaining placeholders
    finalUrl = finalUrl.replace(/{replace_it}/g, finalSubAffId);

    return { success: true, redirectUrl: finalUrl };

  } catch (e) {
    console.error('[submitLead] Critical error:', e);
    return { success: false, error: e.message };
  }
}