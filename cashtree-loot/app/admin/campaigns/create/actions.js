'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- 1. CREATE CAMPAIGN (Now supports Affiliate Link) ---
export async function createCampaign(formData) {
  const title = formData.get('title');
  const landing_url = formData.get('landing_url'); // e.g. "motwal"
  const affiliate_link = formData.get('affiliate_link'); // e.g. "https://tracking..."
  const user_reward = formData.get('user_reward');
  const payout_amount = formData.get('payout_amount');
  const description = formData.get('description');
  const category = formData.get('category');
  const icon_url = formData.get('icon_url');

  // Validate
  if (!title || !landing_url) {
    return { success: false, error: 'Title and URL Slug are required.' };
  }

  // Insert
  const { error } = await supabaseAdmin.from('campaigns').insert({
    title,
    landing_url: landing_url.trim(), // ✅ Save EXACT slug (No auto-formatting)
    affiliate_link,                  // ✅ Save Redirect Link
    user_reward: parseFloat(user_reward) || 0,
    payout_amount: parseFloat(payout_amount) || 0,
    description,
    category,
    icon_url,
    is_active: true,
    created_at: new Date().toISOString(),
  });

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/campaigns');
  redirect('/admin/campaigns');
}

// --- 2. UPDATE CAMPAIGN ---
export async function updateCampaign(campaignId, formData) {
  try {
    const updates = {
      title: formData.get('title'),
      description: formData.get('description'), 
      user_reward: parseFloat(formData.get('user_reward')) || 0,
      payout_amount: parseFloat(formData.get('payout_amount')) || 0,
      
      // ✅ LOGIC FIX: Save slug and link separately
      landing_url: formData.get('landing_url').trim(),
      affiliate_link: formData.get('affiliate_link'),

      category: formData.get('category'),
      icon_url: formData.get('icon_url'),
    };

    const { error } = await supabaseAdmin
      .from('campaigns')
      .update(updates)
      .eq('id', campaignId);

    if (error) throw error;

    revalidatePath('/admin/campaigns');
    return { success: true };
    
  } catch (e) {
    console.error("Update Failed:", e);
    return { success: false, error: e.message };
  }
}

// --- 3. TOGGLE STATUS ---
export async function toggleCampaignStatus(campaignId, currentStatus) {
  try {
    const { error } = await supabaseAdmin
      .from('campaigns')
      .update({ is_active: !currentStatus })
      .eq('id', campaignId);

    if (error) throw error;

    revalidatePath('/admin/campaigns');
    return { success: true };

  } catch (e) {
    return { success: false, error: e.message };
  }
}

// --- 4. DELETE CAMPAIGN ---
export async function deleteCampaign(campaignId) {
  try {
    const { error } = await supabaseAdmin
      .from('campaigns')
      .delete()
      .eq('id', campaignId);

    if (error) throw error;

    revalidatePath('/admin/campaigns');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}