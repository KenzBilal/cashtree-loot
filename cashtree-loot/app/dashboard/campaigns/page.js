import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import CampaignsInterface from './CampaignsInterface';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {

  // ── 1. Auth ──────────────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const token = cookieStore.get('ct_session')?.value;
  if (!token) redirect('/login');

  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
  if (authError || !user) redirect('/login');

  // ── 2. Parallel data fetch ───────────────────────────────────────────────
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const [campaignsResult, settingsResult, accountResult] = await Promise.all([
    supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('is_active', true)
      .order('payout_amount', { ascending: false }),

    supabaseAdmin
      .from('promoter_campaign_settings')
      .select('campaign_id, user_bonus, promoter_share')
      .eq('account_id', user.id),

    // ✅ FIX: username comes from accounts table, not auth metadata
    supabaseAdmin
      .from('accounts')
      .select('username')
      .eq('id', user.id)
      .single(),
  ]);

  // ── 3. Error handling ────────────────────────────────────────────────────
  if (campaignsResult.error) {
    console.error('[CampaignsPage] Failed to load campaigns:', campaignsResult.error);
    return (
      <div style={{
        textAlign: 'center', padding: '60px 20px',
        color: '#ef4444', fontSize: '14px', fontWeight: '700',
      }}>
        ⚠️ Could not load missions. Please refresh the page.
      </div>
    );
  }

  if (settingsResult.error) {
    console.error('[CampaignsPage] Failed to load user settings:', settingsResult.error);
  }

  if (accountResult.error) {
    console.error('[CampaignsPage] Failed to load account:', accountResult.error);
  }

  // ── 4. Username — sourced from accounts table ────────────────────────────
  const promoterUsername = accountResult.data?.username || null;

  // ── 5. Render ────────────────────────────────────────────────────────────
  return (
    <div style={{ paddingBottom: '100px' }}>
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '28px', fontWeight: '900', color: '#fff',
          margin: '0 0 8px', letterSpacing: '-1px',
        }}>
          Available <span style={{ color: '#00ff88' }}>Missions</span>
        </h1>
        <p style={{ fontSize: '13px', color: '#888', fontWeight: '600', margin: 0 }}>
          Complete tasks below to earn instant rewards.
        </p>
      </div>

      <CampaignsInterface
        campaigns={campaignsResult.data ?? []}
        promoterId={user.id}
        promoterUsername={promoterUsername}
        userSettings={settingsResult.data ?? []}
      />
    </div>
  );
}