'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Target, 
  CheckCircle2, 
  Banknote, 
  Users, 
  Shield, 
  Mail, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function AdminSidebar({ adminName, logoutAction }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive Check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on route change (Mobile)
  useEffect(() => {
    if (isMobile) setIsOpen(false);
  }, [pathname, isMobile]);

  const navItems = [
    { name: 'Overview', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'Campaigns', path: '/admin/campaigns', icon: <Target size={18} /> },
    { name: 'Approvals', path: '/admin/leads', icon: <CheckCircle2 size={18} /> },
    { name: 'Finance', path: '/admin/finance', icon: <Banknote size={18} /> },
    { name: 'Promoters', path: '/admin/users', icon: <Users size={18} /> },
    { name: 'Audit Logs', path: '/admin/audit', icon: <Shield size={18} /> },
    { name: 'Inquiries', path: '/admin/inquiries', icon: <Mail size={18} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> },
  ];

  return (
    <>
      {/* GLOBAL RESPONSIVE STYLES INJECTION */}
      <style jsx global>{`
        :root {
          --sidebar-width: 260px;
          --bg-dark: #050505;
          --border-color: #222;
          --accent-color: #00ff88;
        }
        
        /* Layout Adjustment */
        .admin-main {
          margin-left: var(--sidebar-width);
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: calc(100% - var(--sidebar-width));
        }

        @media (max-width: 1024px) {
          .admin-main {
            margin-left: 0 !important;
            width: 100% !important;
            padding: 20px !important;
          }
        }
      `}</style>

      {/* MOBILE HEADER (Visible only on Mobile) */}
      <div style={{
        display: isMobile ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        background: 'rgba(5, 5, 5, 0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #222',
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <div style={logoIconStyle}>C</div>
          <span style={{color: '#fff', fontWeight: '800', fontSize: '15px'}}>CashTree Admin</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{background: 'none', border: 'none', color: '#fff', cursor: 'pointer'}}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* BACKDROP OVERLAY */}
      {isMobile && isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 49
          }}
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside style={{
        width: '260px',
        height: '100vh',
        background: '#050505',
        borderRight: '1px solid #222',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        paddingTop: isMobile ? '0' : '0'
      }}>
        
        {/* BRANDING (Desktop) */}
        <div style={{
          padding: '30px 24px',
          marginBottom: '10px',
          display: isMobile ? 'none' : 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={logoIconStyle}>C</div>
          <div>
            <div style={{color: '#fff', fontWeight: '800', fontSize: '16px', letterSpacing: '-0.5px'}}>CashTree</div>
            <div style={{color: '#666', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px'}}>Network Admin</div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav style={{padding: '0 12px 20px', flex: 1, overflowY: 'auto'}}>
          <div style={{padding: '0 12px 12px', fontSize: '11px', fontWeight: '700', color: '#444', textTransform: 'uppercase', letterSpacing: '1px'}}>Menu</div>
          
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            
            return (
              <Link 
                key={item.path} 
                href={item.path} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  marginBottom: '4px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.2s ease',
                  background: isActive ? 'rgba(0, 255, 136, 0.08)' : 'transparent',
                  color: isActive ? '#00ff88' : '#888',
                  border: isActive ? '1px solid rgba(0, 255, 136, 0.1)' : '1px solid transparent',
                }}
              >
                <span style={{opacity: isActive ? 1 : 0.7}}>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* USER FOOTER */}
        <div style={{
          marginTop: 'auto',
          padding: '24px',
          borderTop: '1px solid #1a1a1a',
          background: '#080808'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px'}}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', 
              background: '#1a1a1a', border: '1px solid #333', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
            }}>
              👑
            </div>
            <div style={{overflow: 'hidden'}}>
              <div style={{color: '#fff', fontSize: '13px', fontWeight: '700'}}>{adminName || 'Super Admin'}</div>
              <div style={{color: '#00ff88', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px'}}>
                <span style={{width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88'}}></span> Online
              </div>
            </div>
          </div>
          
          <form action={logoutAction}>
            <button style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(255, 68, 68, 0.05)',
              border: '1px solid rgba(255, 68, 68, 0.15)',
              color: '#ff4444',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: '0.2s'
            }}>
              <LogOut size={14} /> Sign Out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

// Sub-style for reuse
const logoIconStyle = {
  width: '32px',
  height: '32px',
  background: 'rgba(0, 255, 136, 0.1)',
  border: '1px solid rgba(0, 255, 136, 0.2)',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#00ff88',
  fontWeight: '800',
  fontSize: '18px',
  boxShadow: '0 0 15px rgba(0, 255, 136, 0.1)'
};