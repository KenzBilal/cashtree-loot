'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function updateLeadStatus(leadId, newStatus) {
  try {
    console.log(`⚡ Updating Lead ${leadId} to ${newStatus}...`);

    // 1. Prepare the update object
    // ✅ FIX: We only update 'status', not 'approved'
    const updates = {
      status: newStatus,          
      updated_at: new Date().toISOString()
    };

    // 2. Run Update
    const { error } = await supabaseAdmin
      .from('leads')
      .update(updates)
      .eq('id', leadId);

    if (error) {
      console.error("❌ DB Error:", error.message);
      return { success: false, error: error.message };
    }

    // 3. Refresh Data
    revalidatePath('/admin/leads');
    revalidatePath('/admin'); // Refresh dashboard stats too
    return { success: true };

  } catch (e) {
    console.error("❌ Server Error:", e);
    return { success: false, error: e.message };
  }
}