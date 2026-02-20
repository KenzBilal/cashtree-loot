import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from './supabaseAdmin'; 

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('ct_session')?.value;

  // 1. If no session cookie, kick them out
  if (!token) {
    redirect('/login');
  }

  // 2. Verify the token with Supabase
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !user) {
    redirect('/login');
  }

  // 3. Check if they actually have the 'admin' role in the database
  const { data: account } = await supabaseAdmin
    .from('accounts')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!account || account.role !== 'admin') {
    // If they are a normal user trying to do admin stuff, block them
    redirect('/'); 
  }

  // Return the user object in case the action needs it
  return user;
}