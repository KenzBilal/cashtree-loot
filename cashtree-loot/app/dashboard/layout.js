import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import MobileNav from './MobileNav';
import Sidebar from './Sidebar';

export default async function DashboardLayout({ children }) {
  // 1. GET TOKEN SECURELY
  const cookieStore = await cookies();
  const token = cookieStore.get('ct_session')?.value;

  if (!token) {
    redirect('/login');
  }

  // 2. CREATE AUTHENTICATED CLIENT (Crucial Fix)
  // We inject the token into headers so Supabase knows WHO is asking.
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
  // We fetch user and account status in parallel for max speed
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  // Fetch Account Details (Role, Frozen Status)
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('role, is_frozen')
    .eq('id', user.id)
    .single();

  if (accountError || !account) {
    // If auth exists but account row is missing, force login (or signup)
    redirect('/login');
  }

  // 4. SECURITY GATES
  
  // A. Check Freeze Status (Ban Hammer)
  if (account.is_frozen) {
    redirect('/login?error=Account_Suspended');
  }

  // B. Check Maintenance Mode (Skip for Admins)
  if (account.role !== 'admin') {
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
      return <MaintenanceScreen />;
    }
  }

  // 5. RENDER THE PREMIUM UI
  return (
    <div style={{minHeight: '100vh', background: '#030305', color: '#fff'}}>
      
      {/* --- DESKTOP: SIDEBAR (Hidden on Mobile) --- */}
      <div className="sidebar-wrapper">
        <Sidebar />
      </div>

      {/* --- MOBILE: TOP BAR (Optional, for brand) --- */}
      <div className="mobile-header">
        <div style={{fontWeight: '900', fontSize: '18px', letterSpacing: '-1px'}}>
          Cash<span style={{color: '#00ff88'}}>Tree</span>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="main-content">
        <div style={{maxWidth: '800px', margin: '0 auto'}}>
          {children}
        </div>
      </div>

      {/* --- MOBILE: BOTTOM NAV (Hidden on Desktop) --- */}
      <div className="mobile-nav-wrapper">
        <MobileNav />
      </div>

      {/* --- RESPONSIVE CSS LOGIC --- */}
      <style>{`
        /* MOBILE FIRST (Default) */
        .sidebar-wrapper { display: none; }
        .mobile-nav-wrapper { display: block; }
        .mobile-header {
          display: flex; align-items: center; justify-content: center;
          height: 60px; border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(0,0,0,0.5); backdrop-filter: blur(10px);
          position: sticky; top: 0; z-index: 40;
        }
        .main-content { 
          padding: 20px 20px 100px 20px; /* Bottom padding for nav */
          min-height: 100vh;
        }

        /* DESKTOP (Screens larger than 768px) */
        @media (min-width: 768px) {
          .sidebar-wrapper { display: block; }
          .mobile-nav-wrapper { display: none; }
          .mobile-header { display: none; }
          
          .main-content {
            padding: 40px;
            padding-left: 300px; /* Push content right of sidebar */
          }
        }
      `}</style>

    </div>
  );
}

// ---------------------------------------------------------
// COMPONENT: MAINTENANCE SCREEN (Animated)
// ---------------------------------------------------------
function MaintenanceScreen() {
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
      <div style={{
        fontSize: '60px', marginBottom: '20px', 
        filter: 'drop-shadow(0 0 20px rgba(234, 179, 8, 0.4))',
        animation: 'bounce 2s infinite'
      }}>🛠️</div>
      
      <h1 style={{fontSize: '28px', fontWeight: '900', marginBottom: '10px', color: '#fff'}}>System Upgrade</h1>
      <p style={{color: '#888', maxWidth: '320px', lineHeight: '1.6', fontSize: '14px'}}>
        We are pushing a security update to the CashTree servers.
        <br/><br/>
        <span style={{
          color: '#eab308', fontSize: '11px', fontWeight: '800', 
          textTransform: 'uppercase', letterSpacing: '1px',
          padding: '6px 12px', background: 'rgba(234, 179, 8, 0.1)',
          borderRadius: '12px', border: '1px solid rgba(234, 179, 8, 0.2)'
        }}>
          Estimated Time: 15 Mins
        </span>
      </p>
      
      <style>{`
        @keyframes bounce { 
          0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 
          40% {transform: translateY(-20px);} 
          60% {transform: translateY(-10px);} 
        }
      `}</style>
    </div>
  );
}