'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- HELPER: Smart URL Formatter ---
// Auto-converts "motwal" -> "https://cashttree.online/motwal"
function formatLandingUrl(input) {
  if (!input) return '';
  
  // If it's a full link, keep it
  if (input.startsWith('http://') || input.startsWith('https://')) {
    return input;
  }

  // Else, append to base domain
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashttree.online';
  const path = input.startsWith('/') ? input : `/${input}`;
  return `${baseUrl}${path}`;
}

// 1. TOGGLE STATUS
export async function toggleCampaignStatus(campaignId, currentStatus) {
  try {
    const { error } = await supabaseAdmin
      .from('campaigns')
      .update({ 
        is_active: !currentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId);

    if (error) throw error;

    // Refresh everything
    revalidatePath('/admin/campaigns');
    revalidatePath('/dashboard/campaigns');
    return { success: true };

  } catch (e) {
    return { success: false, error: e.message };
  }
}

// 2. UPDATE CAMPAIGN (Full Power)
export async function updateCampaign(campaignId, formData) {
  try {
    const rawUrl = formData.get('landing_url');

    const updates = {
      title: formData.get('title'),
      description: formData.get('description'), // Added description support
      payout_amount: parseFloat(formData.get('payout_amount')) || 0,
      user_reward: parseFloat(formData.get('user_reward')) || 0,
      
      // ✅ Smart URL Logic
      landing_url: formatLandingUrl(rawUrl),
      
      category: formData.get('category'),
      icon_url: formData.get('icon_url'),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabaseAdmin
      .from('campaigns')
      .update(updates)
      .eq('id', campaignId);

    if (error) throw error;

    // Refresh everything
    revalidatePath('/admin/campaigns');
    revalidatePath('/dashboard/campaigns');
    
    return { success: true };

  } catch (e) {
    console.error("Update Failed:", e);
    return { success: false, error: e.message };
  }
}