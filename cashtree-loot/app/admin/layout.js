export const runtime = 'edge';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import AdminSidebar from './AdminSidebar'; // Import the file you just created

export default async function AdminLayout({ children }) {
  // 1. GATEKEEPER LOGIC (Server Side Security)
  const cookieStore = await cookies();
  const token = cookieStore.get('ct_session')?.value;

  if (!token) redirect('/login');

  // Verify Token
  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
  if (userError || !user) redirect('/login');

  // Verify Admin Role (Using Service Key to bypass RLS)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: account, error: accountError } = await supabaseAdmin
    .from('accounts')
    .select('role, username, is_frozen')
    .eq('id', user.id)
    .single();

  if (accountError || !account || account.role !== 'admin' || account.is_frozen) {
    redirect('/login');
  }

  // 2. SERVER ACTION FOR LOGOUT
  async function handleLogout() {
    'use server';
    const cookieStore = await cookies();
    cookieStore.delete('ct_session'); // Clear cookie
    redirect('/login');
  }

  // 3. THE UI SHELL
  return (
    <div style={{minHeight: '100vh', background: '#000', display: 'flex'}}>
      
      {/* CLIENT SIDEBAR (Passes Props) */}
      <AdminSidebar adminName={account.username} logoutAction={handleLogout} />

      {/* MAIN CONTENT AREA */}
      <main style={{
        flex: 1,
        marginLeft: '260px', // Matches Sidebar Width
        padding: '40px',
        background: '#000',
        minHeight: '100vh',
        color: '#fff'
      }}>
        {children}
      </main>
    </div>
  );
}