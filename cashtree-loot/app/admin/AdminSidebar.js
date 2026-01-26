'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function AdminSidebar({ adminName, logoutAction }) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState('');

  // --- NAVIGATION CONFIG ---
  const navItems = [
    { name: 'Overview', path: '/admin', icon: '📊' },
    { name: 'Campaigns', path: '/admin/campaigns', icon: '🎯' },
    { name: 'Approvals', path: '/admin/leads', icon: '✅' },
    { name: 'Finance', path: '/admin/finance', icon: '💰' },
    { name: 'Promoters', path: '/admin/users', icon: '👥' },
    { name: 'Audit Logs', path: '/admin/audit', icon: '🛡️' },
  ];

  // --- STYLES ---
  const sidebarStyle = {
    width: '260px',
    height: '100vh',
    background: '#0a0a0a',
    borderRight: '1px solid #222',
    position: 'fixed',
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 50,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const logoSectionStyle = {
    padding: '24px',
    borderBottom: '1px solid #1a1a1a',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const logoIconStyle = {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(135deg, #22c55e, #166534)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '18px'
  };

  const linkStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    margin: '4px 12px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    background: isActive ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
    color: isActive ? '#4ade80' : '#888',
    borderLeft: isActive ? '3px solid #4ade80' : '3px solid transparent',
  });

  const footerStyle = {
    marginTop: 'auto',
    padding: '20px',
    borderTop: '1px solid #1a1a1a',
    background: '#050505'
  };

  return (
    <aside style={sidebarStyle}>
      
      {/* BRANDING */}
      <div style={logoSectionStyle}>
        <div style={logoIconStyle}>C</div>
        <div>
          <div style={{color: '#fff', fontWeight: 'bold', fontSize: '15px'}}>CashTree</div>
          <div style={{color: '#22c55e', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '800'}}>Admin Console</div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav style={{padding: '20px 0', flex: 1}}>
        <div style={{padding: '0 24px 10px', fontSize: '11px', fontWeight: '700', color: '#444', textTransform: 'uppercase', letterSpacing: '1px'}}>Menu</div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path} 
              style={linkStyle(isActive)}
              onMouseEnter={() => setIsHovered(item.path)}
              onMouseLeave={() => setIsHovered('')}
            >
              <span style={{fontSize: '16px', filter: isActive ? 'none' : 'grayscale(100%)'}}>{item.icon}</span>
              <span style={{color: isActive || isHovered === item.path ? '#fff' : '#888'}}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* USER FOOTER */}
      <div style={footerStyle}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px'}}>
          <div style={{width: '32px', height: '32px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px'}}>👑</div>
          <div style={{overflow: 'hidden'}}>
            <div style={{color: '#fff', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap'}}>{adminName || 'Admin'}</div>
            <div style={{color: '#555', fontSize: '11px'}}>Super Admin</div>
          </div>
        </div>
        
        <form action={logoutAction}>
          <button style={{
            width: '100%',
            padding: '10px',
            background: '#1a0000',
            border: '1px solid #450a0a',
            color: '#f87171',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}>
            Log Out
          </button>
        </form>
      </div>
    </aside>
  );
}