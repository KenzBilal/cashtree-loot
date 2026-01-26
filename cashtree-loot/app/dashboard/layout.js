import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Init Supabase (Anon key is fine here, RLS protects the data)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('ct_session')?.value;

  // 1. AUTH CHECK
  if (!token) redirect('/login');

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) redirect('/login');

  // 2. ROLE & SECURITY CHECK (Fetch Account)
  const { data: account, error: accError } = await supabase
    .from('accounts')
    .select('role, is_frozen')
    .eq('id', user.id)
    .single();

  if (accError || !account) redirect('/login');
  
  // Security Redirects
  if (account.role === 'admin') redirect('/admin'); // Admins go to their castle
  if (account.is_frozen) redirect('/login?error=frozen'); // Banned users blocked

  // 3. UI SHELL (Mobile First)
  return (
    <div className="min-h-screen bg-black text-white pb-24 font-sans">
      
      {/* MAIN CONTENT */}
      <main className="p-6 max-w-md mx-auto">
        {children}
      </main>

      {/* BOTTOM NAVIGATION (Fixed) */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/10 z-50">
        <div className="flex justify-around items-center p-2 max-w-md mx-auto">
          
          <NavLink href="/dashboard" icon="fa-home" label="Home" />
          <NavLink href="/dashboard/tasks" icon="fa-bullseye" label="Tasks" />
          <NavLink href="/dashboard/leads" icon="fa-chart-bar" label="Activity" />
          <NavLink href="/dashboard/wallet" icon="fa-wallet" label="Wallet" />
          <NavLink href="/dashboard/profile" icon="fa-user" label="Profile" />

        </div>
      </nav>
    </div>
  );
}

// Helper for Active/Inactive Links
function NavLink({ href, icon, label }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-green-500 transition-colors focus:text-green-500">
      <i className={`fas ${icon} text-xl mb-0.5`}></i>
      <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
    </Link>
  );
}