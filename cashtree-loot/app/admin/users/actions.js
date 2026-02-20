'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/requireAdmin';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── 1. FREEZE / UNFREEZE ACCOUNT ──
export async function toggleUserStatus(userId, currentStatus) {
  await requireAdmin();

  const newStatus = !currentStatus;

  const { error } = await supabaseAdmin
    .from('accounts')
    .update({ is_frozen: newStatus })
    .eq('id', userId);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/users');
  return { success: true, frozen: newStatus };
}

// ── 2. RESET USER BALANCE ──
export async function resetUserBalance(userId) {
  await requireAdmin();

  try {
    const { error } = await supabaseAdmin
      .from('accounts')
      .update({ balance: 0 })
      .eq('id', userId);

    if (error) throw error;

    revalidatePath('/admin/users');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ── 3. MANUALLY CREDIT USER WALLET ──
export async function creditUserWallet(userId, amount, reason) {
  await requireAdmin();

  try {
    const credit = parseFloat(amount);
    if (!credit || credit <= 0) {
      return { success: false, error: 'Invalid amount.' };
    }

    // A. Add ledger entry
    const { error: ledgerError } = await supabaseAdmin
      .from('ledger')
      .insert({
        account_id:  userId,
        type:        'task_earning',
        amount:      credit,
        description: reason?.trim() || 'Manual credit by admin',
      });

    if (ledgerError) throw ledgerError;

    // B. Update balance
    const { data: account } = await supabaseAdmin
      .from('accounts')
      .select('balance')
      .eq('id', userId)
      .single();

    await supabaseAdmin
      .from('accounts')
      .update({ balance: (account?.balance || 0) + credit })
      .eq('id', userId);

    revalidatePath('/admin/users');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ── 4. DEDUCT FROM USER WALLET ──
export async function deductUserWallet(userId, amount, reason) {
  await requireAdmin();

  try {
    const deduct = parseFloat(amount);
    if (!deduct || deduct <= 0) {
      return { success: false, error: 'Invalid amount.' };
    }

    // A. Add negative ledger entry
    const { error: ledgerError } = await supabaseAdmin
      .from('ledger')
      .insert({
        account_id:  userId,
        type:        'task_earning',
        amount:      -deduct,
        description: reason?.trim() || 'Manual deduction by admin',
      });

    if (ledgerError) throw ledgerError;

    // B. Update balance
    const { data: account } = await supabaseAdmin
      .from('accounts')
      .select('balance')
      .eq('id', userId)
      .single();

    const newBalance = Math.max(0, (account?.balance || 0) - deduct);
    await supabaseAdmin
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', userId);

    revalidatePath('/admin/users');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ── 5. UPDATE USER ROLE ──
export async function updateUserRole(userId, newRole) {
  await requireAdmin();

  try {
    if (!['user', 'admin'].includes(newRole)) {
      return { success: false, error: 'Invalid role.' };
    }

    const { error } = await supabaseAdmin
      .from('accounts')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) throw error;

    revalidatePath('/admin/users');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ── 6. UPDATE USER UPI ID ──
export async function updateUserUpi(userId, upiId) {
  await requireAdmin();

  try {
    if (!upiId?.includes('@')) {
      return { success: false, error: 'Invalid UPI ID format.' };
    }

    const { error } = await supabaseAdmin
      .from('accounts')
      .update({ upi_id: upiId.trim() })
      .eq('id', userId);

    if (error) throw error;

    revalidatePath('/admin/users');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ── 7. DELETE USER ACCOUNT ──
// Permanently deletes from auth + accounts table
export async function deleteUserAccount(userId) {
  await requireAdmin();

  try {
    // A. Delete from Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    // B. accounts row cascades via FK — but delete manually if no cascade set
    await supabaseAdmin
      .from('accounts')
      .delete()
      .eq('id', userId);

    revalidatePath('/admin/users');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ── 8. RESET USER PASSWORD ──
export async function resetUserPassword(userId, newPassword) {
  await requireAdmin();

  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) throw error;

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}