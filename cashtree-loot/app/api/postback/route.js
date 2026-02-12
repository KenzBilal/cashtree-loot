import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ⚠️ CRITICAL: This ensures the API runs fresh every time (no caching)
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ Must use Service Key to bypass RLS
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  // 1. CAPTURE DATA FROM UPRISE
  // Uprise sends the Lead UUID (which we called 'aff_click_id') as 'user_id'
  const lead_id = searchParams.get('user_id'); 
  
  // Uprise sends the status (e.g., 'install', 'sale', 'registration')
  // For some campaigns, you only want to pay on 'sale' or 'video_kyc'.
  const status = searchParams.get('status');
  
  // OPTIONAL: Uprise sends how much they paid YOU (e.g. 450.00)
  // You can use this to double-check amounts if you want.
  const network_payout = searchParams.get('payout'); 

  console.log(`🔔 Postback Received: Lead ${lead_id} | Status: ${status}`);

  if (!lead_id) {
    return NextResponse.json({ error: 'Missing User ID' }, { status: 400 });
  }

  try {
    // 2. FIND THE LEAD IN YOUR DATABASE
    const { data: lead, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .single();

    if (fetchError || !lead) {
      return NextResponse.json({ error: 'Lead not found in DB' }, { status: 404 });
    }

    // 3. IDEMPOTENCY CHECK (Don't pay twice!)
    if (lead.status === 'Approved') {
      return NextResponse.json({ message: 'Lead already processed' });
    }

    // 4. APPROVE & DISTRIBUTE MONEY
    // ---------------------------------------------------------
    // 💡 STRATEGY: You can add an 'if' check here to only approve
    // specific statuses (e.g. if (status === 'sale') ...)
    // For now, we assume any postback means Success.
    // ---------------------------------------------------------

    // A. Update Lead Status to 'Approved'
    const { error: updateError } = await supabase
      .from('leads')
      .update({ 
        status: 'Approved', 
        admin_comment: `Auto-verified via Uprise Postback (Status: ${status})`
      })
      .eq('id', lead_id);

    if (updateError) throw updateError;

    // B. Pay the PROMOTER (Commission)
    // We only pay if there is a referrer AND the calculated payout is > 0
    if (lead.referred_by && lead.payout > 0) {
      await supabase.from('ledger').insert({
        account_id: lead.referred_by,
        amount: lead.payout,
        type: 'commission',
        description: `Commission: ${lead.user_name} (Campaign #${lead.campaign_id})`
      });
    }

    // C. Pay the USER (Incentive)
    // Note: Since 'leads' table stores the UPI ID in 'customer_data', 
    // we don't have a direct 'account_id' for the end-user unless they are a registered member.
    // If you run a "Task App" where users log in, you would pay them here.
    // For now, we just record the status change so you can pay their UPI manually/bulk later.

    return NextResponse.json({ 
      success: true, 
      message: 'Lead Approved & Promoter Credited' 
    });

  } catch (err) {
    console.error("Postback Critical Error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}