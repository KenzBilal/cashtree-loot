'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { name: 'Dashboard',    path: '/dashboard',           icon: '🏠' },
  { name: 'Earn',         path: '/dashboard/campaigns', icon: '🔥' },
  { name: 'Network',      path: '/dashboard/team',      icon: '🕸' },
  { name: 'My Wallet',    path: '/dashboard/wallet',    icon: '💰' },
  { name: 'My Profile',   path: '/dashboard/profile',   icon: '👤' },
  { name: 'Activity Log', path: '/dashboard/leads',     icon: '📋' }, // ← was 'Tj'
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '260px', height: '100vh',
      background: 'rgba(5,5,5,0.97)',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      padding: '28px 18px',
      display: 'flex', flexDirection: 'column',
      zIndex: 50,
      backdropFilter: 'blur(20px)',
    }}>

      {/* Brand */}
      <div style={{
        fontSize: '20px', fontWeight: '900', color: '#fff',
        marginBottom: '44px', paddingLeft: '10px',
        display: 'flex', alignItems: 'center', gap: '10px',
        letterSpacing: '-0.5px',
      }}>
        <span style={{ color: '#00ff88' }}>⚡</span> CashTree
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              style={{
                display: 'flex', alignItems: 'center', gap: '13px',
                padding: '13px 16px', borderRadius: '13px',
                textDecoration: 'none', fontSize: '14px',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? '#000' : '#777',
                background: isActive
                  ? 'linear-gradient(90deg, #00ff88, #00c46a)'
                  : 'transparent',
                transition: 'all 0.2s',
                boxShadow: isActive ? '0 0 18px rgba(0,255,136,0.28)' : 'none',
              }}
            >
              <span style={{
                fontSize: '17px',
                color: isActive ? '#000' : '#fff',
              }}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingLeft: '10px' }}>
        <div style={{ fontSize: '11px', color: '#333', fontWeight: '700' }}>
          Promoter Dashboard
        </div>
        <div style={{ fontSize: '10px', color: '#2a2a2a', marginTop: '2px' }}>
          v2.0 Premium
        </div>
      </div>

    </div>
  );
}