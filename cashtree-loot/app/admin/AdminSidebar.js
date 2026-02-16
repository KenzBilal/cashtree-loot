'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Target, 
  CheckCircle2, 
  Banknote, 
  Users, 
  Shield, 
  Mail, 
  Settings,
  LogOut
} from 'lucide-react';

export default function AdminSidebar({ adminName, logoutAction }) {
  const pathname = usePathname();
  const [hoveredPath, setHoveredPath] = useState(null);

  // --- NAVIGATION CONFIG ---
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

  // --- 10/10 STYLES ---
  const sidebarStyle = {
    width: '260px',
    height: '100vh',
    background: '#050505', // Matches Dashboard Background
    borderRight: '1px solid #222',
    position: 'fixed',
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 50,
    fontFamily: '"Inter", sans-serif'
  };

  const logoSectionStyle = {
    padding: '30px 24px',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const logoIconStyle = {
    width: '36px',
    height: '36px',
    background: 'rgba(0, 255, 136, 0.1)', // Neon Glass
    border: '1px solid rgba(0, 255, 136, 0.2)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#00ff88',
    fontWeight: '800',
    fontSize: '20px',
    boxShadow: '0 0 15px rgba(0, 255, 136, 0.1)'
  };

  const linkStyle = (isActive, isHovered) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    margin: '4px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '500',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    // Glass Active State
    background: isActive ? 'rgba(0, 255, 136, 0.08)' : isHovered ? '#111' : 'transparent',
    color: isActive ? '#00ff88' : isHovered ? '#fff' : '#888',
    borderLeft: isActive ? '3px solid #00ff88' : '3px solid transparent',
  });

  const footerStyle = {
    marginTop: 'auto',
    padding: '24px',
    borderTop: '1px solid #1a1a1a',
    background: '#020202'
  };

  return (
    <aside style={sidebarStyle}>
      {/* BRANDING */}
      <div style={logoSectionStyle}>
        <div style={logoIconStyle}>C</div>
        <div>
          <div style={{color: '#fff', fontWeight: '800', fontSize: '16px', letterSpacing: '-0.5px'}}>CashTree</div>
          <div style={{color: '#666', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px'}}>Network Admin</div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav style={{padding: '0 0 20px 0', flex: 1, overflowY: 'auto'}}>
        <div style={{padding: '0 24px 12px', fontSize: '11px', fontWeight: '700', color: '#444', textTransform: 'uppercase', letterSpacing: '1px'}}>Main Menu</div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const isHovered = hoveredPath === item.path;
          
          return (
            <Link 
              key={item.path} 
              href={item.path} 
              style={linkStyle(isActive, isHovered)}
              onMouseEnter={() => setHoveredPath(item.path)}
              onMouseLeave={() => setHoveredPath(null)}
            >
              {/* Icon Wrapper for Glow */}
              <span style={{
                display: 'flex', 
                filter: isActive ? 'drop-shadow(0 0 8px rgba(0,255,136,0.4))' : 'none',
                opacity: isActive || isHovered ? 1 : 0.7
              }}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* USER FOOTER */}
      <div style={footerStyle}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px'}}>
          <div style={{width: '36px', height: '36px', borderRadius: '50%', background: '#222', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'}}>
            👑
          </div>
          <div style={{overflow: 'hidden'}}>
            <div style={{color: '#fff', fontSize: '13px', fontWeight: '700'}}>{adminName || 'Super Admin'}</div>
            <div style={{color: '#00ff88', fontSize: '11px'}}>● Online</div>
          </div>
        </div>
        
        <form action={logoutAction}>
          <button 
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(255, 68, 68, 0.05)',
              border: '1px solid rgba(255, 68, 68, 0.1)',
              color: '#ff4444',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: '0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 68, 68, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 68, 68, 0.05)'}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}