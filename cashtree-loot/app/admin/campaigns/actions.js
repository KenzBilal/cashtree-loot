'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- 1. CREATE CAMPAIGN (Required for Create Page) ---
export async function createCampaign(formData) {
  const title = formData.get('title');
  const landing_url = formData.get('landing_url'); // e.g. "motwal"
  const affiliate_link = formData.get('affiliate_link'); // e.g. "https://tracking..."
  const user_reward = formData.get('user_reward');
  const description = formData.get('description');
  const icon_url = formData.get('icon_url');

  if (!title || !landing_url || !user_reward) {
    return { error: 'Missing required fields' };
  }

  const { error } = await supabaseAdmin.from('campaigns').insert({
    title,
    landing_url: landing_url.trim(), // ✅ Save EXACT slug
    affiliate_link,                  // ✅ Save Redirect Link
    user_reward,
    description,
    icon_url,
    is_active: true
  });

  if (error) return { error: error.message };

  revalidatePath('/admin/campaigns');
  redirect('/admin/campaigns');
}

// --- 2. TOGGLE STATUS (Kept Exact) ---
export async function toggleCampaignStatus(campaignId, currentStatus) {
  try {
    const { error } = await supabaseAdmin
      .from('campaigns')
      .update({ is_active: !currentStatus })
      .eq('id', campaignId);

    if (error) throw error;

    revalidatePath('/admin/campaigns');
    revalidatePath('/dashboard/campaigns');
    return { success: true };

  } catch (e) {
    return { success: false, error: e.message };
  }
}

// --- 3. UPDATE CAMPAIGN (Fixed for New Logic) ---
export async function updateCampaign(formData) {
  const id = formData.get('id');
  
  try {
    const updates = {
      title: formData.get('title'),
      description: formData.get('description'), 
      user_reward: parseFloat(formData.get('user_reward')) || 0,
      
      // ✅ LOGIC FIX: Save slug and link separately
      landing_url: formData.get('landing_url').trim(),
      affiliate_link: formData.get('affiliate_link'),

      icon_url: formData.get('icon_url'),
      is_active: formData.get('is_active') === 'on'
    };

    const { error } = await supabaseAdmin
      .from('campaigns')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/campaigns');
    revalidatePath('/dashboard/campaigns');
    
  } catch (e) {
    console.error("Update Failed:", e);
    return { success: false, error: e.message };
  }

  // Redirect must be outside try/catch
  redirect('/admin/campaigns');
}

// --- 4. DELETE CAMPAIGN (Kept Exact) ---
export async function deleteCampaign(campaignId) {
  try {
    const { error } = await supabaseAdmin
      .from('campaigns')
      .delete()
      .eq('id', campaignId);

    if (error) throw error;

    revalidatePath('/admin/campaigns');
    revalidatePath('/dashboard/campaigns');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}