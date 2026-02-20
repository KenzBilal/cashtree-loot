'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/requireAdmin';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function updateSystemConfig(formData) {
  await requireAdmin();

  try {
    const updates = {
      maintenance_mode: formData.get('maintenance') === 'on',
      min_withdrawal:   parseFloat(formData.get('min_w')) || 500,
      support_whatsapp: formData.get('whatsapp'),
      notice_board:     formData.get('notice'),
    };

    const { error } = await supabaseAdmin
      .from('system_config')
      .update(updates)
      .eq('id', 1);

    if (error) throw error;

    revalidatePath('/admin/settings');
    return { success: true, message: 'System configuration updated successfully.' };

  } catch (error) {
    return { success: false, message: error.message };
  }
}