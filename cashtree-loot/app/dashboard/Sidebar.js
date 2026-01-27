'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { name: 'Earn Money', path: '/dashboard/campaigns', icon: '🔥' },
    { name: 'Network', path: '/dashboard/team', icon: '🕸' },
    { name: 'My Wallet', path: '/dashboard/wallet', icon: '💰' },
    { name: 'My Profile', path: '/dashboard/profile', icon: '👤' },
    { name: 'Activity Log', path: '/dashboard/leads', icon: 'Tj' },
  ];

  // --- STYLES ---
  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '260px',
    height: '100vh',
    background: 'rgba(5, 5, 5, 0.95)', // Deep Black
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '30px 20px',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 50,
    backdropFilter: 'blur(20px)'
  };

  const logoStyle = {
    fontSize: '22px', fontWeight: '900', color: '#fff', 
    marginBottom: '50px', paddingLeft: '10px',
    display: 'flex', alignItems: 'center', gap: '10px'
  };

  return (
    <div className="desktop-sidebar" style={sidebarStyle}>
      
      {/* BRAND LOGO */}
      <div style={logoStyle}>
        <span style={{color: '#00ff88'}}>⚡</span> CashTree
      </div>

      {/* NAVIGATION LINKS */}
      <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 16px',
                borderRadius: '14px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? '#000' : '#888',
                background: isActive ? 'linear-gradient(90deg, #00ff88, #00b36b)' : 'transparent',
                transition: 'all 0.2s',
                boxShadow: isActive ? '0 0 20px rgba(0, 255, 136, 0.3)' : 'none'
              }}
            >
              <span style={{fontSize: '18px', color: isActive ? '#000' : '#fff'}}>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* FOOTER INFO */}
      <div style={{marginTop: 'auto', paddingLeft: '10px'}}>
        <div style={{fontSize: '11px', color: '#444', fontWeight: 'bold'}}>Promoter Dashboard</div>
        <div style={{fontSize: '10px', color: '#333'}}>v2.0 Premium</div>
      </div>

    </div>
  );
}