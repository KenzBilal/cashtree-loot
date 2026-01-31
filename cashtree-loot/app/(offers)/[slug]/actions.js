'use server';

import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

// Initialize Supabase with Service Role Key for secure writes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function submitLead(formData) {
  const campaign_id = formData.get('campaign_id');
  const user_name = formData.get('user_name');
  const upi_id = formData.get('upi_id');
  const phone = formData.get('phone'); // ✅ NEW: Capture Phone Number
  const referral_code = formData.get('referral_code');
  const redirect_url = formData.get('redirect_url');

  // 1. Resolve Referral Code to Promoter ID
  let promoter_id = null;
  if (referral_code) {
    // ✅ FIX: Searching 'accounts' table instead of 'users'
    const { data: promoter } = await supabase
      .from('accounts') 
      .select('id')
      .eq('username', referral_code.toUpperCase()) // Ensure matching case
      .single();
    
    if (promoter) promoter_id = promoter.id;
  }

  // 2. Insert the Lead into DB
  const { error } = await supabase.from('leads').insert({
    campaign_id: campaign_id,
    user_name: user_name,
    // ✅ FIX: Save both UPI and Phone
    customer_data: { 
      upi: upi_id,
      phone: phone 
    }, 
    referred_by: promoter_id,
    status: 'Pending',
    payout: 0 
  });

  if (error) {
    console.error("Lead Error:", error);
    // On error, fallback to Google (or your choice)
    redirect('https://google.com'); 
  }

  // 3. REDIRECT THE USER to the Real Offer
  redirect(redirect_url && redirect_url !== '#' ? redirect_url : 'https://google.com');
}