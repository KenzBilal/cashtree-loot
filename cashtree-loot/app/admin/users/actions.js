'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function toggleUserStatus(userId, currentStatus) {
  // Flip the status (if frozen, unfreeze. if active, freeze)
  const newStatus = !currentStatus;

  const { error } = await supabaseAdmin
    .from('accounts')
    .update({ is_frozen: newStatus })
    .eq('id', userId);

  if (error) throw new Error(error.message);

  // Refresh the page data immediately
  revalidatePath('/admin/users');
}