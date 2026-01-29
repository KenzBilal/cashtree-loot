'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- HELPER: Smart URL Formatter ---
// ✅ FEATURE: Type "motwal" -> Saves "https://cashttree.online/motwal"
function formatLandingUrl(input) {
  if (!input) return '';
  
  // 1. If it's already a full link (http/https), leave it alone
  if (input.startsWith('http://') || input.startsWith('https://')) {
    return input;
  }

  // 2. Get the Base URL (Localhost or Live)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashttree.online';

  // 3. If it starts with slash (e.g. "/motwal"), just prepend base
  if (input.startsWith('/')) {
    return `${baseUrl}${input}`;
  }

  // 4. If it's just a word (e.g. "motwal"), add slash and prepend base
  return `${baseUrl}/${input}`;
}

export async function createCampaign(formData) {
  // 1. Extract & Format Data
  const rawUrl = formData.get('landing_url');

  const newCampaign = {
    title: formData.get('title'),
    description: formData.get('description'),
    payout_amount: parseFloat(formData.get('payout_amount')),
    user_reward: parseFloat(formData.get('user_reward')),
    
    // ✅ APPLIED FIX: Using the formatter function here
    landing_url: formatLandingUrl(rawUrl),
    
    icon_url: formData.get('icon_url'),
    category: formData.get('category'),
    is_active: true, // Auto-activate
    created_at: new Date().toISOString(),
  };

  // 2. Validate
  if (!newCampaign.title || !newCampaign.landing_url) {
    return { success: false, error: 'Title and URL are required.' };
  }

  // 3. Insert into DB
  const { error } = await supabaseAdmin
    .from('campaigns')
    .insert([newCampaign]);

  if (error) {
    // Return error to the client component
    return { success: false, error: error.message };
  }

  // 4. Refresh & Redirect
  // We revalidate the main list so the new campaign shows up instantly
  revalidatePath('/admin/campaigns');
  redirect('/admin/campaigns');
}