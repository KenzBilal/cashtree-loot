import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import MobileNav from './MobileNav';

export default async function DashboardLayout({ children }) {
  // 1. GET TOKEN
  const cookieStore = await cookies();
  const token = cookieStore.get('ct_session')?.value;

  if (!token) {
    redirect('/login');
  }

  // 2. CREATE AUTHENTICATED CLIENT (THE FIX 🛠️)
  // We inject the token into the headers so Supabase knows WHO is asking.
  // This prevents the "Anonymous" RLS error that causes the login loop.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  // 3. VERIFY USER & FETCH ACCOUNT
  // We perform these checks in parallel for speed, but secure them with the token.
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  // Fetch Account Details (Role, Frozen Status)
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('role, is_frozen, username')
    .eq('id', user.id)
    .single();

  if (accountError || !account) {
    // If user exists in Auth but not in Accounts table, send to login
    redirect('/login');
  }

  // 4. SECURITY CHECKS
  
  // A. Check Freeze Status
  if (account.is_frozen) {
    redirect('/login?error=Account_Suspended');
  }

  // B. Check Maintenance Mode (Skip for Admins)
  if (account.role !== 'admin') {
    // We use a fresh client for public config to ensure no RLS conflicts
    const publicClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: config } = await publicClient
      .from('system_config')
      .select('maintenance_mode')
      .eq('id', 1)
      .single();

    if (config?.maintenance_mode) {
      return (
        <div style={{
          height: '100vh', 
          background: '#050505', 
          color: '#fff', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          textAlign: 'center', 
          padding: '20px'
        }}>
          <div style={{fontSize: '60px', marginBottom: '20px', animation: 'bounce 2s infinite'}}>🛠️</div>
          <h1 style={{fontSize: '24px', fontWeight: '900', marginBottom: '10px', color: '#eab308'}}>System Maintenance</h1>
          <p style={{color: '#888', maxWidth: '320px', lineHeight: '1.6'}}>
            We are currently upgrading the CashTree servers to serve you better.
            <br/><br/>
            <span style={{color: '#444', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase'}}>Estimated Return: 30 Mins</span>
          </p>
          <style>{`@keyframes bounce { 0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 40% {transform: translateY(-20px);} 60% {transform: translateY(-10px);} }`}</style>
        </div>
      );
    }
  }

  // 5. RENDER THE DASHBOARD SHELL
  return (
    <div style={{minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '90px'}}>
      
      {/* DESKTOP SIDEBAR (Visible only on large screens) */}
      <aside className="desktop-only" style={{
        position: 'fixed', left: 0, top: 0, width: '260px', height: '100%', 
        borderRight: '1px solid #222', padding: '30px', background: '#050505',
        display: 'none' // Hidden by default, you can add media query in global.css to show on Desktop
      }}>
        <div style={{fontSize: '24px', fontWeight: '900', marginBottom: '50px', letterSpacing: '-1px'}}>
          Cash<span style={{color: '#22c55e'}}>Tree</span>
        </div>
        <nav style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
          <NavLink href="/dashboard" icon="🏠" label="Home" />
          <NavLink href="/dashboard/campaigns" icon="🔥" label="Earn Money" />
          <NavLink href="/dashboard/wallet" icon="💰" label="My Wallet" />
          <NavLink href="/dashboard/profile" icon="👤" label="My Profile" />
        </nav>
      </aside>

      {/* MOBILE NAV (Always Visible on Mobile) */}
      <MobileNav />

      {/* MAIN CONTENT AREA */}
      <main style={{maxWidth: '600px', margin: '0 auto', padding: '20px', position: 'relative'}}>
        {children}
      </main>

    </div>
  );
}

// Helper for Sidebar Links
function NavLink({ href, icon, label }) {
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 16px', 
      borderRadius: '14px', color: '#888', textDecoration: 'none', fontWeight: '600',
      transition: 'all 0.2s', border: '1px solid transparent'
    }}>
      <span style={{fontSize: '20px'}}>{icon}</span>
      <span style={{fontSize: '14px'}}>{label}</span>
    </Link>
  );
}