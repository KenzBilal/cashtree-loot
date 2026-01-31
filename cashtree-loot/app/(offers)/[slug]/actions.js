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

  let promoter_id = null;
  if (referral_code) {
    const { data: promoter } = await supabase
      .from('accounts') 
      .select('id')
      .eq('username', referral_code.toUpperCase()) 
      .single();
    if (promoter) promoter_id = promoter.id;
  }

  // Insert Lead
  const { error } = await supabase.from('leads').insert({
    campaign_id: campaign_id,
    user_name: user_name,
    customer_data: { upi: upi_id, phone: phone }, 
    referred_by: promoter_id,
    status: 'Pending',
    payout: 0 
  });

  if (error) {
    console.error("Lead Error:", error);
    // ✅ CHANGE THIS LINE TO SEND THE REAL ERROR:
    return { success: false, error: error.message }; 
  }

  // Return the URL to the client so it can redirect nicely
  return { 
    success: true, 
    redirectUrl: redirect_url && redirect_url !== '#' ? redirect_url : 'https://google.com' 
  };
}