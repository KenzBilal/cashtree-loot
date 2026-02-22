'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/requireAdmin';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── CREATE CAMPAIGN ──
export async function createCampaign(formData) {
  // ✅ FIX: requireAdmin was missing — anyone could create campaigns
  await requireAdmin();

  const title          = formData.get('title')?.trim();
  const landing_url    = formData.get('landing_url')?.trim();
  const affiliate_link = formData.get('affiliate_link')?.trim() || null;
  const description    = formData.get('description')?.trim()    || null;
  const category       = formData.get('category')?.trim()       || null;
  const icon_url       = formData.get('icon_url')?.trim()       || null;
  const user_reward    = parseFloat(formData.get('user_reward'))   || 0;
  const payout_amount  = parseFloat(formData.get('payout_amount')) || 0;

  if (!title || !landing_url) {
    return { success: false, error: 'Title and URL Slug are required.' };
  }

  if (user_reward > payout_amount) {
    return {
      success: false,
      error: `User Reward (₹${user_reward}) cannot exceed Total Limit (₹${payout_amount}).`,
    };
  }

  const { error } = await supabaseAdmin.from('campaigns').insert({
    title, landing_url, affiliate_link,
    user_reward, payout_amount,
    description, category, icon_url,
    is_active: true,
    // ✅ created_at omitted — DB default now() handles it
  });

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'That URL slug is already taken. Choose another.' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/campaigns');
  // ✅ FIX: redirect() inside server action called from client handleSubmit breaks —
  // it throws a Next.js redirect error that gets caught as a failure.
  // Return success and let CreateForm.js handle the redirect client-side.
  return { success: true };
}