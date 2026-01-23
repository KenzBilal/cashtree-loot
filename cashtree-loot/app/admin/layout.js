// app/admin/layout.js

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/* =========================================================
   ANON CLIENT — AUTH VALIDATION ONLY
========================================================= */
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: { persistSession: false }
  }
);

/* =========================================================
   ADMIN GATEKEEPER
========================================================= */
export default async function AdminLayout({ children }) {
  const cookieStore = cookies();
  const token = cookieStore.get('ct_session')?.value;

  /* -----------------------------------------
     1. No session → redirect
     ----------------------------------------- */
  if (!token) {
    redirect('/login');
  }

  /* -----------------------------------------
     2. Validate session (ANON KEY)
     ----------------------------------------- */
  const { data: userData, error: userError } =
    await supabaseAuth.auth.getUser(token);

  if (userError || !userData?.user) {
    redirect('/login');
  }

  const userId = userData.user.id;

  /* -----------------------------------------
     3. Check role from DB (SERVICE ROLE)
     ----------------------------------------- */
  const { data: account, error: accountError } =
    await supabaseAdmin
      .from('accounts')
      .select('role, is_frozen')
      .eq('id', userId)
      .single();

  if (
    accountError ||
    !account ||
    account.role !== 'admin' ||
    account.is_frozen
  ) {
    redirect('/login');
  }

  /* -----------------------------------------
     4. ACCESS GRANTED
     ----------------------------------------- */
  return children;
}
