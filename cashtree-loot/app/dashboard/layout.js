import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import MobileNav from './MobileNav';

export default async function DashboardLayout({ children }) {
  // 1. GATEKEEPER (Auth Check)
  const cookieStore = await cookies();
  const token = cookieStore.get('ct_session')?.value;

  if (!token) {
    redirect('/login');
  }

  // Use a fresh client for this request
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // 2. VERIFY USER
  // We manually pass the access token to getUser to ensure it works on the server
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);

  if (userError || !user) {
    // If token is invalid/expired, kill cookie and go to login
    redirect('/login');
  }

  // 3. FETCH ACCOUNT DATA (Role & Freeze Status)
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('role, is_frozen, username')
    .eq('id', user.id)
    .single();

  // If no account found in DB, something is wrong -> Login
  if (accountError || !account) {
    redirect('/login');
  }

  // 4. CHECK IF FROZEN
  if (account.is_frozen) {
    redirect('/login?error=Account_Suspended');
  }

  // 5. CHECK MAINTENANCE MODE
  // We fetch system_config ONLY if we need to enforce it.
  // We skip this check for Admins so they can always see the dashboard if they want.
  if (account.role !== 'admin') {
     const { data: config } = await supabase
       .from('system_config')
       .select('maintenance_mode')
       .eq('id', 1)
       .single();

     if (config?.maintenance_mode) {
       return (
         <div style={{
           height: '100vh', 
           background: '#000', 
           color: '#fff', 
           display: 'flex', 
           flexDirection: 'column', 
           alignItems: 'center', 
           justifyContent: 'center', 
           textAlign: 'center', 
           padding: '20px'
         }}>
           <div style={{fontSize: '50px', marginBottom: '20px'}}>🛠️</div>
           <h1 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '10px'}}>System Maintenance</h1>
           <p style={{color: '#888', maxWidth: '300px'}}>We are upgrading the servers. The dashboard will be back shortly.</p>
         </div>
       );
     }
  }

  // 6. RENDER DASHBOARD
  return (
    <div style={{minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '80px'}}>
      
      {/* DESKTOP SIDEBAR (Hidden on Mobile) */}
      <aside className="desktop-only" style={{
        position: 'fixed', left: 0, top: 0, width: '240px', height: '100%', 
        borderRight: '1px solid #222', padding: '20px', display: 'none'
      }}>
        <div style={{fontSize: '20px', fontWeight: '900', marginBottom: '40px'}}>
          Cash<span style={{color: '#22c55e'}}>Tree</span>
        </div>
        <nav style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
          <NavLink href="/dashboard" icon="🏠" label="Home" />
          <NavLink href="/dashboard/campaigns" icon="🔥" label="Earn" />
          <NavLink href="/dashboard/wallet" icon="💰" label="Wallet" />
          <NavLink href="/dashboard/profile" icon="👤" label="Profile" />
        </nav>
      </aside>

      {/* MOBILE NAV (Visible on Phone) */}
      <MobileNav />

      {/* MAIN CONTENT */}
      <main style={{maxWidth: '600px', margin: '0 auto', padding: '20px'}}>
        {children}
      </main>

    </div>
  );
}

// Helper Component
function NavLink({ href, icon, label }) {
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', 
      borderRadius: '12px', color: '#888', textDecoration: 'none', fontWeight: '600',
      transition: 'background 0.2s'
    }}>
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}