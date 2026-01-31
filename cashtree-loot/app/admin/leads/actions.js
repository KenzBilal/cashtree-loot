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
    const updates = {
      status: newStatus,          // Update Text Column (Pending/Approved)
      updated_at: new Date().toISOString()
    };

    // 2. SAFETY: If you have an 'approved' boolean column, sync it too
    // (This fixes the "approved is false" issue you saw in DB)
    if (newStatus === 'Approved') {
      updates.approved = true;
    } else if (newStatus === 'Rejected' || newStatus === 'Pending') {
      updates.approved = false;
    }

    // 3. Run Update
    const { error } = await supabaseAdmin
      .from('leads')
      .update(updates)
      .eq('id', leadId);

    if (error) {
      console.error("❌ DB Error:", error.message);
      return { success: false, error: error.message };
    }

    // 4. Refresh Data
    revalidatePath('/admin/leads');
    return { success: true };

  } catch (e) {
    console.error("❌ Server Error:", e);
    return { success: false, error: e.message };
  }
}