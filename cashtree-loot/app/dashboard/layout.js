import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { ShieldAlert, Clock, RefreshCw } from 'lucide-react'; // ✅ Added Icons
import Link from 'next/link'; // ✅ Added Link
import MobileNav from './MobileNav';
import Sidebar from './Sidebar';

export default async function DashboardLayout({ children }) {
  // 1. GET TOKEN SECURELY
  const cookieStore = await cookies();
  const token = cookieStore.get('ct_session')?.value;

  if (!token) {
    redirect('/login');
  }

  // 2. CREATE AUTHENTICATED CLIENT
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
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('role, is_frozen')
    .eq('id', user.id)
    .single();

  if (accountError || !account) {
    redirect('/login');
  }

  // 4. SECURITY GATES
  
  // A. Check Freeze Status
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
      return <MaintenanceScreen />; // ✅ Renders the new 10/10 screen
    }
  }

  // 5. RENDER THE PREMIUM UI
  return (
    <div style={{minHeight: '100vh', background: '#030305', color: '#fff'}}>
      
      {/* --- DESKTOP: SIDEBAR --- */}
      <div className="sidebar-wrapper">
        <Sidebar />
      </div>

      {/* --- MOBILE: TOP BAR --- */}
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

      {/* --- MOBILE: BOTTOM NAV --- */}
      <div className="mobile-nav-wrapper">
        <MobileNav />
      </div>

      {/* --- RESPONSIVE CSS --- */}
      <style>{`
        .sidebar-wrapper { display: none; }
        .mobile-nav-wrapper { display: block; }
        .mobile-header {
          display: flex; align-items: center; justify-content: center;
          height: 60px; border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(0,0,0,0.5); backdrop-filter: blur(10px);
          position: sticky; top: 0; z-index: 40;
        }
        .main-content { 
          padding: 20px 20px 100px 20px; 
          min-height: 100vh;
        }

        @media (min-width: 768px) {
          .sidebar-wrapper { display: block; }
          .mobile-nav-wrapper { display: none; }
          .mobile-header { display: none; }
          .main-content {
            padding: 40px;
            padding-left: 300px; 
          }
        }
      `}</style>

    </div>
  );
}

// ---------------------------------------------------------
// COMPONENT: 10/10 MAINTENANCE SCREEN (Neon Red Glass)
// ---------------------------------------------------------
function MaintenanceScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: '#050505',
      color: 'white', fontFamily: '"Inter", sans-serif', padding: '20px',
      position: 'relative', overflow: 'hidden'
    }}>
      
      {/* Background Glow FX */}
      <div style={{
        position: 'absolute', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, rgba(0,0,0,0) 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0
      }} />

      {/* Glass Card */}
      <div style={{
        position: 'relative', zIndex: 10,
        background: 'rgba(10, 10, 15, 0.6)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '24px',
        padding: '60px 40px', maxWidth: '480px', width: '100%', textAlign: 'center',
        boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8)'
      }}>
        
        {/* Animated Icon */}
        <div style={{
          width: '80px', height: '80px', margin: '0 auto 30px',
          background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)'
        }}>
          <ShieldAlert size={40} color="#ef4444" className="pulse-icon" />
        </div>

        <h1 style={{fontSize: '2rem', fontWeight: '800', marginBottom: '10px', color: '#fff', letterSpacing: '-1px'}}>
          System Under Maintenance
        </h1>
        
        <p style={{color: '#888', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '30px'}}>
          Our engineers are currently pushing a critical security update. 
          Access is temporarily restricted to ensure data integrity.
        </p>

        {/* Status Box */}
        <div style={{
          background: '#000', border: '1px solid #222', borderRadius: '12px',
          padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          marginBottom: '30px'
        }}>
          <Clock size={16} color="#ef4444" />
          <span style={{fontSize: '0.9rem', color: '#ccc', fontWeight: '600'}}>
            Estimated Downtime: <span style={{color: '#fff'}}>~30 Mins</span>
          </span>
        </div>

        {/* Manual Reload Button */}
        <a 
          href="/dashboard"
          style={{
            background: '#fff', color: '#000', border: 'none', padding: '14px 28px',
            borderRadius: '10px', fontSize: '14px', fontWeight: '800', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '8px', transition: '0.2s',
            textDecoration: 'none'
          }}
        >
          <RefreshCw size={16} /> Check Status
        </a>

      </div>

      <style>{`
        @keyframes pulse { 
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 
          70% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); } 
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } 
        }
        .pulse-icon { animation: pulse 2s infinite; }
      `}</style>
    </div>
  );
}