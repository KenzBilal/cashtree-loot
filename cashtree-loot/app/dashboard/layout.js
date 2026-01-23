import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

/* =========================================================
   SERVER-ONLY SUPABASE CLIENT
   ========================================================= */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false }
  }
);

/* =========================================================
   PROMOTER DASHBOARD GATEKEEPER
   ========================================================= */
export default async function DashboardLayout({ children }) {
  const cookieStore = cookies();
  const token = cookieStore.get('ct_session')?.value;

  /* -----------------------------------------
     1. No session → login
     ----------------------------------------- */
  if (!token) {
    redirect('/login');
  }

  /* -----------------------------------------
     2. Validate session with Supabase
     ----------------------------------------- */
  const { data: userData, error: userError } =
    await supabase.auth.getUser(token);

  if (userError || !userData?.user) {
    redirect('/login');
  }

  const userId = userData.user.id;

  /* -----------------------------------------
     3. Fetch account role
     ----------------------------------------- */
  const { data: account, error: accountError } =
    await supabase
      .from('accounts')
      .select('role, is_frozen')
      .eq('id', userId)
      .single();

  if (accountError || !account) {
    redirect('/login');
  }

  /* -----------------------------------------
     4. Enforce promoter-only access
     ----------------------------------------- */
  if (account.is_frozen) {
    redirect('/login');
  }

  if (account.role === 'admin') {
    redirect('/admin');
  }

  if (account.role !== 'promoter') {
    redirect('/login');
  }

  /* -----------------------------------------
     5. ACCESS GRANTED
     ----------------------------------------- */
  return children;
}
