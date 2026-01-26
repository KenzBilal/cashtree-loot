import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Link from 'next/link';

export default async function AdminLayout({ children }) {
  // 1. GATEKEEPER LOGIC (Your Code)
  const cookieStore = awaitcookies();
  const token = cookieStore.get('ct_session')?.value;

  if (!token) redirect('/login');

  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
  if (userError || !userData?.user) redirect('/login');

  // 2. CHECK DATABASE ROLE (Your Schema)
  const { data: account, error: accountError } = await supabaseAdmin
    .from('accounts')
    .select('role, is_frozen')
    .eq('id', userData.user.id)
    .single();

  if (accountError || !account || account.role !== 'admin' || account.is_frozen) {
    redirect('/login');
  }

  // 3. THE UI SHELL (Sidebar + Content)
  return (
    <div className="flex min-h-screen bg-black text-white font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/10 bg-[#050505] flex flex-col fixed h-full z-50">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-bold text-black">A</div>
          <div>
            <div className="font-bold text-sm">CashTree</div>
            <div className="text-[10px] text-green-500 uppercase tracking-widest">Admin</div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <AdminLink href="/admin" icon="fa-chart-pie" label="Overview" />
          <AdminLink href="/admin/campaigns" icon="fa-bullseye" label="Campaigns" />
          <AdminLink href="/admin/leads" icon="fa-check-circle" label="Approvals" />
          <AdminLink href="/admin/finance" icon="fa-wallet" label="Finance" />
          <AdminLink href="/admin/users" icon="fa-users" label="Promoters" />
          <AdminLink href="/admin/audit" icon="fa-shield-alt" label="Audit Logs" />
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}

// Helper Component for Sidebar Links
function AdminLink({ href, icon, label }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
      <i className={`fas ${icon} w-5 text-center`}></i>
      {label}
    </Link>
  );
}