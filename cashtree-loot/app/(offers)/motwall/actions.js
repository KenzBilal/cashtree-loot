'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function submitMotwalLead(formData) {
  const phone = formData.get('phone');
  const upi = formData.get('upi');
  const refCode = formData.get('ref_code'); // Gets "USER123" from the hidden input

  // 1. Basic Validation
  if (!phone || phone.length < 10) {
    return { success: false, error: 'Please enter a valid 10-digit phone number.' };
  }

  try {
    // --- A. FIND CAMPAIGN ID ---
    const { data: camp, error: e1 } = await supabaseAdmin
      .from('campaigns')
      .select('id')
      .ilike('title', '%Motwal%')
      .maybeSingle();

    if (!camp) return { success: false, error: "System Error: Campaign 'Motwal' not active." };

    // --- B. FIND PROMOTER ID ---
    let promoterUuid = null;
    if (refCode) {
      const { data: acc } = await supabaseAdmin
        .from('accounts')
        .select('id')
        .eq('username', refCode.toUpperCase())
        .eq('role', 'promoter')
        .maybeSingle();

      if (acc) promoterUuid = acc.id;
    }

    // --- C. CHECK DUPLICATE (Anti-Spam) ---
    const { data: existing } = await supabaseAdmin
      .from('leads')
      .select('id')
      .eq('phone', phone)
      .eq('campaign_id', camp.id)
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'You have already registered for this offer.' };
    }

    // --- D. SAVE LEAD ---
    const { error: e3 } = await supabaseAdmin
      .from('leads')
      .insert({
        campaign_id: camp.id,
        promoter_id: promoterUuid, // Linked to promoter!
        user_name: 'Motwal User',  // Placeholder name or add input if needed
        phone: phone,
        status: 'pending',
        customer_data: `UPI: ${upi}`, // Storing UPI in custom data
        created_at: new Date().toISOString()
      });

    if (e3) throw e3;

    return { success: true };

  } catch (err) {
    console.error('Motwal Error:', err);
    return { success: false, error: 'Server busy. Try again.' };
  }
}