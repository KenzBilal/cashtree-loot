'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 1. TOGGLE STATUS
export async function toggleCampaignStatus(campaignId, currentStatus) {
  const { error } = await supabaseAdmin
    .from('campaigns')
    .update({ is_active: !currentStatus })
    .eq('id', campaignId);

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/campaigns');
  return { success: true };
}

// 2. UPDATE CAMPAIGN
export async function updateCampaign(campaignId, formData) {
  const updates = {
    title: formData.get('title'),
    payout_amount: parseFloat(formData.get('payout_amount')),
    user_reward: parseFloat(formData.get('user_reward')),
    landing_url: formData.get('landing_url'),
    category: formData.get('category'),
    icon_url: formData.get('icon_url'),
  };

  const { error } = await supabaseAdmin
    .from('campaigns')
    .update(updates)
    .eq('id', campaignId);

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/campaigns');
  return { success: true };
}