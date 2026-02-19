import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { ShieldAlert, Clock, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import MobileNav from './MobileNav';
import Sidebar from './Sidebar';

export default async function DashboardLayout({ children }) {

  // 1. GET TOKEN
  const cookieStore = await cookies();
  const token = cookieStore.get('ct_session')?.value;
  if (!token) redirect('/login');

  // 2. AUTHENTICATED CLIENT
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  // 3. VERIFY USER
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect('/login');

  // 4. FETCH ACCOUNT
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('role, is_frozen')
    .eq('id', user.id)
    .single();

  if (accountError || !account) redirect('/login');

  // 5. SECURITY GATES

  // A. Frozen account
  if (account.is_frozen) redirect('/login?error=Account_Suspended');

  // B. Maintenance mode (skip for admins)
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

    if (config?.maintenance_mode) return <MaintenanceScreen />;
  }

  // 6. RENDER
  return (
    <div style={{ minHeight: '100vh', background: '#030305', color: '#fff' }}>

      <style>{`
        .sb-wrapper  { display: none; }
        .mob-nav-wrap{ display: block; }
        .mob-header  {
          display: flex; align-items: center; justify-content: center;
          height: 58px; border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(0,0,0,0.5); backdrop-filter: blur(12px);
          position: sticky; top: 0; z-index: 40;
        }
        .main-content { padding: 20px 20px 100px; min-height: 100vh; }

        @media (min-width: 768px) {
          .sb-wrapper   { display: block; }
          .mob-nav-wrap { display: none; }
          .mob-header   { display: none; }
          .main-content { padding: 40px; padding-left: 300px; }
        }
      `}</style>

      {/* Desktop sidebar */}
      <div className="sb-wrapper">
        <Sidebar />
      </div>

      {/* Mobile top bar */}
      <div className="mob-header">
        <div style={{ fontWeight: '900', fontSize: '18px', letterSpacing: '-1px', color: '#fff' }}>
          Cash<span style={{ color: '#00ff88' }}>Tree</span>
        </div>
      </div>

      {/* Page content */}
      <div className="main-content">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {children}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="mob-nav-wrap">
        <MobileNav />
      </div>

    </div>
  );
}

// ── MAINTENANCE SCREEN ──
function MaintenanceScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#050505', color: '#fff',
      padding: '20px', position: 'relative', overflow: 'hidden',
    }}>

      <style>{`
        @keyframes maintPulse {
          0%   { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          70%  { box-shadow: 0 0 0 20px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
        .maint-icon-wrap { animation: maintPulse 2s infinite; }
      `}</style>

      {/* Red ambient glow */}
      <div style={{
        position: 'absolute',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 0, pointerEvents: 'none',
      }} />

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 10,
        background: 'rgba(10,10,15,0.7)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(239,68,68,0.25)', borderRadius: '24px',
        padding: '56px 40px', maxWidth: '460px', width: '100%', textAlign: 'center',
        boxShadow: '0 24px 60px -12px rgba(0,0,0,0.8)',
      }}>

        {/* Icon */}
        <div
          className="maint-icon-wrap"
          style={{
            width: '76px', height: '76px', margin: '0 auto 28px',
            background: 'rgba(239,68,68,0.08)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(239,68,68,0.25)',
          }}
        >
          <ShieldAlert size={38} color="#ef4444" />
        </div>

        <h1 style={{
          fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: '900',
          margin: '0 0 12px', letterSpacing: '-0.03em',
        }}>
          System Under Maintenance
        </h1>

        <p style={{ color: '#777', fontSize: '14px', lineHeight: '1.7', margin: '0 0 28px' }}>
          Our engineers are pushing a critical security update.
          Access is temporarily restricted to ensure data integrity.
        </p>

        {/* ETA box */}
        <div style={{
          background: '#000', border: '1px solid #1a1a1a', borderRadius: '12px',
          padding: '14px 20px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '10px', marginBottom: '28px',
        }}>
          <Clock size={15} color="#ef4444" />
          <span style={{ fontSize: '13px', color: '#ccc', fontWeight: '600' }}>
            Estimated Downtime:&nbsp;<span style={{ color: '#fff', fontWeight: '800' }}>~30 mins</span>
          </span>
        </div>

        {/* Check status */}
        <a
          href="/dashboard"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#fff', color: '#000',
            padding: '13px 28px', borderRadius: '12px',
            fontSize: '13px', fontWeight: '900',
            textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.8px',
            transition: 'transform 0.2s',
          }}
        >
          <RefreshCw size={15} /> Check Status
        </a>
      </div>
    </div>
  );
}