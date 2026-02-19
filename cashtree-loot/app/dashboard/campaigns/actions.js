'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// ── Helpers ────────────────────────────────────────────────────────────────

/** Integer-safe rupee math: work in paise (×100) to avoid floating-point drift. */
const toPaise = (amount) => Math.round(parseFloat(amount) * 100);

/** Authenticate the incoming request and return the Supabase user, or null. */
async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('ct_session')?.value;
  if (!token) return null;

  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user }, error } = await supabaseAuth.auth.getUser();
  if (error || !user) return null;
  return user;
}

// ── Actions ────────────────────────────────────────────────────────────────

/**
 * Saves a promoter's custom payout split for a campaign.
 *
 * Only `userBonus` is trusted from the client.
 * `promoterShare` is derived server-side from the campaign's payout_amount,
 * ensuring the client can never inflate its own commission.
 *
 * @param {string} campaignId
 * @param {number} userBonus   - What the referred user earns (₹)
 */
export async function savePayoutSettings(campaignId, userBonus) {
  try {
    // 1. Validate raw inputs before touching the DB
    const parsedUserBonus = parseFloat(userBonus);
    if (
      !campaignId ||
      isNaN(parsedUserBonus) ||
      parsedUserBonus < 0
    ) {
      return { success: false, error: 'Invalid input values.' };
    }

    // 2. Authenticate
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: 'Unauthorized. Please log in again.' };

    // 3. Fetch campaign limit — the single source of truth
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: campaign, error: campError } = await supabaseAdmin
      .from('campaigns')
      .select('payout_amount')
      .eq('id', campaignId)
      .single();

    if (campError || !campaign) {
      return { success: false, error: 'Campaign not found.' };
    }

    // 4. Server-side math in paise (integer arithmetic — no float drift)
    const maxPaise      = toPaise(campaign.payout_amount);
    const userPaise     = toPaise(parsedUserBonus);
    const promoterPaise = maxPaise - userPaise;

    if (userPaise < 0 || promoterPaise < 0 || userPaise > maxPaise) {
      return {
        success: false,
        error: `Split out of range. Max total is ₹${campaign.payout_amount}.`,
      };
    }

    // Convert back to rupees for storage (2 decimal places)
    const userBonusFinal     = userPaise / 100;
    const promoterShareFinal = promoterPaise / 100;

    // 5. Upsert — insert on first save, update on subsequent saves
    const { error: upsertError } = await supabaseAdmin
      .from('promoter_campaign_settings')
      .upsert(
        {
          account_id:     user.id,
          campaign_id:    campaignId,
          user_bonus:     userBonusFinal,
          promoter_share: promoterShareFinal,
          updated_at:     new Date().toISOString(),
        },
        { onConflict: 'account_id, campaign_id' }
      );

    if (upsertError) {
      console.error('[savePayoutSettings] DB error:', upsertError);
      return {
        success: false,
        error: upsertError.message || 'Database rejected the save. Please try again.',
      };
    }

    // 6. Invalidate server cache so the page re-fetches fresh data
    revalidatePath('/dashboard/campaigns');
    return { success: true };

  } catch (err) {
    console.error('[savePayoutSettings] Unexpected error:', err);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}