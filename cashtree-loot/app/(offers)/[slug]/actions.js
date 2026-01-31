'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function submitLead(formData) {
  const campaign_id = formData.get('campaign_id');
  const user_name = formData.get('user_name');
  const upi_id = formData.get('upi_id');
  const phone = formData.get('phone');
  const referral_code = formData.get('referral_code');
  const redirect_url = formData.get('redirect_url');

  // --- 1. FETCH REAL PAYOUT (Added This Block) ---
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('payout_amount')
    .eq('id', campaign_id)
    .single();
    
  // Default to 0 if something goes wrong, but usually this will have the real value
  const realPayout = campaign?.payout_amount || 0;

  let promoter_id = null;
  if (referral_code) {
    const { data: promoter } = await supabase
      .from('accounts') 
      .select('id')
      .eq('username', referral_code.toUpperCase()) 
      .single();
    if (promoter) promoter_id = promoter.id;
  }

  // --- 2. INSERT LEAD (Updated payout field) ---
  const { error } = await supabase.from('leads').insert({
    campaign_id: campaign_id,
    user_name: user_name,
    customer_data: { upi: upi_id, phone: phone }, 
    referred_by: promoter_id,
    status: 'Pending',
    payout: realPayout // ✅ Now uses the fetched amount
  });

  if (error) {
    console.error("Lead Error:", error);
    return { success: false, error: error.message }; 
  }

  return { 
    success: true, 
    redirectUrl: redirect_url && redirect_url !== '#' ? redirect_url : 'https://google.com' 
  };
}