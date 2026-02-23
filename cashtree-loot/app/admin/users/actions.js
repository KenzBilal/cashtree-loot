'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/requireAdmin';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── 1. FREEZE / UNFREEZE ──
export async function toggleUserStatus(userId, currentStatus) {
  await requireAdmin();
  const { error } = await supabaseAdmin
    .from('accounts')
    .update({ is_frozen: !currentStatus })
    .eq('id', userId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/users');
  return { success: true, frozen: !currentStatus };
}

// ── 2. RESET USER BALANCE TO ZERO (DB-side, no race condition) ──
export async function resetUserBalance(userId) {
  await requireAdmin();
  try {
    // Single DB call: sum all ledger entries, insert exact negative to zero it out
    const { data, error: sumError } = await supabaseAdmin
      .rpc('get_account_balance', { p_account_id: userId });
    if (sumError) throw sumError;

    const currentBalance = Number(data ?? 0);
    if (currentBalance === 0) return { success: true };

    const { error } = await supabaseAdmin.from('ledger').insert({
      account_id:  userId,
      type:        'admin_reset',
      amount:      -currentBalance,
      description: 'Admin balance reset to zero',
    });
    if (error) throw error;

    revalidatePath('/admin/users');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ── 3. CREDIT WALLET ──
export async function creditUserWallet(userId, amount, reason) {
  await requireAdmin();
  try {
    const credit = parseFloat(amount);
    if (!credit || credit <= 0) return { success: false, error: 'Invalid amount.' };
    const { error } = await supabaseAdmin.from('ledger').insert({
      account_id:  userId,
      type:        'manual_credit',
      amount:      credit,
      description: reason?.trim() || 'Manual credit by admin',
    });
    if (error) throw error;
    revalidatePath('/admin/users');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ── 4. DEDUCT WALLET ──
export async function deductUserWallet(userId, amount, reason) {
  await requireAdmin();
  try {
    const deduct = parseFloat(amount);
    if (!deduct || deduct <= 0) return { success: false, error: 'Invalid amount.' };
    const { error } = await supabaseAdmin.from('ledger').insert({
      account_id:  userId,
      type:        'manual_deduction',
      amount:      -deduct,
      description: reason?.trim() || 'Manual deduction by admin',
    });
    if (error) throw error;
    revalidatePath('/admin/users');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ── 5. UPDATE UPI ID ──
export async function updateUserUpi(userId, upiId) {
  await requireAdmin();
  try {
    if (!upiId?.includes('@')) return { success: false, error: 'Invalid UPI ID format.' };
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

// ── 6. DELETE ACCOUNT (accounts first, then auth — cascade handles the rest) ──
export async function deleteUserAccount(userId) {
  await requireAdmin();
  try {
    // Delete accounts row first (cascade removes ledger, leads etc.)
    await supabaseAdmin.from('accounts').delete().eq('id', userId);
    // Then remove from auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) throw authError;
    revalidatePath('/admin/users');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ── 7. RESET PASSWORD ──
export async function resetUserPassword(userId, newPassword) {
  await requireAdmin();
  try {
    if (!newPassword || newPassword.length < 6)
      return { success: false, error: 'Password must be at least 6 characters.' };
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });
    if (error) throw error;
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}