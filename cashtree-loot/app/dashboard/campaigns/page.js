import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import CampaignsInterface from './CampaignsInterface';

// Force dynamic ensures users always see new tasks instantly
export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  // 1. AUTH & SECURITY CHECK
  const cookieStore = await cookies();
  const token = cookieStore.get('ct_session')?.value;
  
  if (!token) redirect('/login');

  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
  
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) redirect('/login');

  // 2. GET PROMOTER DETAILS (Username needed for referral links)
  const promoterUsername = user.user_metadata?.username || user.email?.split('@')[0] || 'promoter';

  // 3. FETCH DATA (Using Service Role to guarantee loading)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // A. Get Active Missions
  const { data: campaigns, error } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .eq('is_active', true) // ✅ Only show active tasks
    .order('payout_amount', { ascending: false }); // Highest paying first

  if (error) {
    console.error("Dashboard Load Error:", error);
    return <div className="p-10 text-center text-red-500">System Error: Could not load missions.</div>;
  }

  // B. ✅ NEW: Get This Promoter's Custom Settings
  // We need to know if they already customized any payouts
  const { data: userSettings } = await supabaseAdmin
    .from('promoter_campaign_settings')
    .select('campaign_id, user_bonus, promoter_share')
    .eq('account_id', user.id);

  // 4. RENDER THE INTERFACE
  return (
    <div style={{paddingBottom: '100px', animation: 'fadeIn 0.5s ease-out'}}>
      
      {/* HEADER SECTION */}
      <div style={{marginBottom: '30px', textAlign: 'center'}}>
        <h1 style={{fontSize: '28px', fontWeight: '900', color: '#fff', margin: '0 0 8px 0', letterSpacing: '-1px'}}>
          Available <span style={{color: '#00ff88'}}>Missions</span>
        </h1>
        <p style={{fontSize: '13px', color: '#888', fontWeight: '600'}}>
          Complete tasks below to earn instant rewards.
        </p>
      </div>

      {/* THE 10/10 INTERACTIVE LIST */}
      <CampaignsInterface 
        campaigns={campaigns || []} 
        promoterId={user.id} 
        promoterUsername={promoterUsername} 
        userSettings={userSettings || []} // ✅ Pass the settings here
      />
      
    </div>
  );
}