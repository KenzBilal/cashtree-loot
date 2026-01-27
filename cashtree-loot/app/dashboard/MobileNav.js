'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: '🏠' },
    { name: 'Earn', path: '/dashboard/campaigns', icon: '🔥' },
    { name: 'Wallet', path: '/dashboard/wallet', icon: '💰' },
    { name: 'Profile', path: '/dashboard/profile', icon: '👤' },
  ];

  // --- STYLES ---
  const navStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '70px',
    background: '#0a0a0a',
    borderTop: '1px solid #222',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 100,
    // Fix for iPhone bottom bar
    paddingBottom: 'env(safe-area-inset-bottom, 20px)' 
  };

  const itemStyle = (isActive) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    width: '100%',
    height: '100%',
    color: isActive ? '#22c55e' : '#666',
    transition: 'color 0.2s ease'
  });

  return (
    <nav style={navStyle}>
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link key={item.path} href={item.path} style={itemStyle(isActive)}>
            <div style={{fontSize: '20px', transform: isActive ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s'}}>
              {item.icon}
            </div>
            <div style={{fontSize: '10px', marginTop: '4px', fontWeight: isActive ? '700' : '500'}}>
              {item.name}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}