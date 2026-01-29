'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function createCampaign(formData) {
  // 1. Extract Data
  const newCampaign = {
    title: formData.get('title'),
    description: formData.get('description'),
    payout_amount: parseFloat(formData.get('payout_amount')),
    user_reward: parseFloat(formData.get('user_reward')),
    landing_url: formData.get('landing_url'),
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
    return { success: false, error: error.message };
  }

  // 4. Refresh & Redirect
  revalidatePath('/admin/campaigns');
  redirect('/admin/campaigns');
}