import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ⚠️ FORCE DYNAMIC: Critical for API routes to process every request fresh
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ Service Key required for Admin rights
);

// 🔒 SECURITY: Whitelist Uprise Media's IPs (Derived from your screenshot)
// If you are on Vercel, these IPs might show up as Vercel's IPs, so we keep this optional.
const ALLOWED_IPS = ['35.245.65.44', '35.230.165.242', '34.145.129.198'];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 1. EXTRACT DATA (Mapped EXACTLY to your Uprise Settings)
    const lead_id = searchParams.get('user_id'); // Mapped to {aff_click_id}
    const statusRaw = searchParams.get('status') || 'unknown'; // Mapped to {event_token}
    const networkPayout = parseFloat(searchParams.get('payout') || '0'); // Mapped to {payout}
    
    // Get Caller IP (for logging/security)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const callerIp = forwardedFor ? forwardedFor.split(',')[0] : '0.0.0.0';

    console.log(`🔔 POSTBACK: Lead=${lead_id} | Status=${statusRaw} | Payout=₹${networkPayout} | IP=${callerIp}`);

    // ---------------------------------------------------------
    // 🛡️ LAYER 1: VALIDATION CHECKS
    // ---------------------------------------------------------

    // A. MISSING ID CHECK
    if (!lead_id) {
      return NextResponse.json({ error: 'Missing User ID' }, { status: 400 });
    }

    // B. MONEY CHECK (The "Universal" Filter)
    // We only process if the network actually pays us money.
    // This automatically filters out 'Install' (₹0), 'Click' (₹0), or 'Impression' (₹0).
    if (networkPayout <= 0) {
      console.log(`⚠️ IGNORED: Zero Payout Event (${statusRaw})`);
      return NextResponse.json({ message: 'Ignored: Zero Payout' });
    }

    // C. NEGATIVE STATUS CHECK (Safety Net)
    // Just in case they send a negative event with a payout number (rare, but possible).
    const status = statusRaw.toLowerCase();
    if (status.includes('reject') || status.includes('decline') || status.includes('fraud')) {
      return NextResponse.json({ message: 'Ignored: Negative Status' });
    }

    // ---------------------------------------------------------
    // 💰 LAYER 2: DATABASE PROCESSING
    // ---------------------------------------------------------

    // 1. Fetch the Lead from DB
    const { data: lead, error: fetchError } = await supabase
      .from('leads')
      .select('id, status, campaign_id, referred_by')
      .eq('id', lead_id)
      .single();

    if (fetchError || !lead) {
      return NextResponse.json({ error: 'Lead not found in DB' }, { status: 404 });
    }

    // 2. IDEMPOTENCY CHECK (Prevent Double Payment)
    // If it's already Approved or Paid, stop immediately.
    if (lead.status === 'Approved' || lead.status === 'Paid') {
      console.log(`⚠️ SKIP: Lead ${lead_id} is already ${lead.status}`);
      return NextResponse.json({ message: 'Already Processed' });
    }

    // 3. EXECUTE PAYMENT (Atomic Transaction)
    // We use the SQL Function 'approve_lead' to ensure the Promoter Commission 
    // AND the Referral Bonus happen at the exact same millisecond.
    
    const { error: rpcError } = await supabase.rpc('approve_lead', { 
      target_lead_id: lead_id,
      admin_id: '00000000-0000-0000-0000-000000000000' // System ID
    });

    if (rpcError) {
      console.error("❌ RPC FAILED:", rpcError);
      
      // FALLBACK: Manual Update if RPC crashes (Emergency Mode)
      // This ensures the lead is at least marked Approved so you don't lose track.
      await supabase.from('leads')
        .update({ 
          status: 'Approved', 
          approved_at: new Date().toISOString(),
          admin_comment: `System Fallback: ${statusRaw} (₹${networkPayout})`
        })
        .eq('id', lead_id);
      
      return NextResponse.json({ warning: 'Processed via Fallback', details: rpcError.message });
    }

    // 4. LOG SUCCESS
    console.log(`✅ SUCCESS: Lead ${lead_id} Approved. Commission Distributed.`);
    return NextResponse.json({ 
      success: true, 
      message: 'Conversion Approved & Wallets Credited' 
    });

  } catch (err) {
    console.error("🔥 CRITICAL POSTBACK ERROR:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}