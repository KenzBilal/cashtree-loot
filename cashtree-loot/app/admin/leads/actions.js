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

    // 1. Prepare the basic update object
    const updates = {
      status: newStatus
    };

    // 2. Handle Timestamps based on your actual Schema
    // Your table has 'approved_at', so we use that.
    if (newStatus === 'Approved') {
      updates.approved_at = new Date().toISOString();
    } else {
      // If rejecting or moving back to pending, clear the approval time
      updates.approved_at = null;
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
    revalidatePath('/admin'); 
    return { success: true };

  } catch (e) {
    console.error("❌ Server Error:", e);
    return { success: false, error: e.message };
  }
}