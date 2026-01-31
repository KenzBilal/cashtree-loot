'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- 1. CREATE CAMPAIGN (Updated with Finance Check) ---
export async function createCampaign(formData) {
  const title = formData.get('title');
  const landing_url = formData.get('landing_url');
  const affiliate_link = formData.get('affiliate_link');
  const description = formData.get('description');
  const category = formData.get('category');
  const icon_url = formData.get('icon_url');

  // Parse Financials
  const user_reward = parseFloat(formData.get('user_reward')) || 0;
  const payout_amount = parseFloat(formData.get('payout_amount')) || 0;

  // 1. Basic Validation
  if (!title || !landing_url) {
    return { success: false, error: 'Title and URL Slug are required.' };
  }

  // ✅ 2. FINANCE SAFETY CHECK
  // Ensure the cashback promise doesn't exceed the total budget
  if (user_reward > payout_amount) {
    return { 
      success: false, 
      error: `Math Error: User Reward (₹${user_reward}) cannot be higher than Total Limit (₹${payout_amount})` 
    };
  }

  // Insert
  const { error } = await supabaseAdmin.from('campaigns').insert({
    title,
    landing_url: landing_url.trim(),
    affiliate_link,
    user_reward,
    payout_amount, // The Hard Ceiling
    description,
    category,
    icon_url,
    is_active: true,
    created_at: new Date().toISOString(),
  });

  if (error) {
    // Handle Duplicate Slugs gracefully
    if (error.code === '23505') return { success: false, error: "Slug already taken. Choose another." };
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/campaigns');
  redirect('/admin/campaigns');
}

// --- 2. UPDATE CAMPAIGN (Updated with Finance Check) ---
export async function updateCampaign(campaignId, formData) {
  try {
    // Parse Financials first
    const user_reward = parseFloat(formData.get('user_reward')) || 0;
    const payout_amount = parseFloat(formData.get('payout_amount')) || 0;

    // ✅ FINANCE SAFETY CHECK (Crucial for Edit Mode too)
    if (user_reward > payout_amount) {
      return { 
        success: false, 
        error: `Math Error: User Reward (₹${user_reward}) cannot exceed Total Limit (₹${payout_amount})` 
      };
    }

    const updates = {
      title: formData.get('title'),
      description: formData.get('description'),
      user_reward,
      payout_amount,
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

// --- 3. TOGGLE STATUS (Unchanged) ---
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

// --- 4. DELETE CAMPAIGN (Unchanged) ---
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