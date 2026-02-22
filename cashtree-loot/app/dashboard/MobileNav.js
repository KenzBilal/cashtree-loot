'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Megaphone,
  Network,
  Wallet,
  UserCircle,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Home',    path: '/dashboard',           Icon: LayoutDashboard },
  { name: 'Earn',    path: '/dashboard/campaigns', Icon: Megaphone },
  { name: 'Network', path: '/dashboard/team',      Icon: Network },
  { name: 'Wallet',  path: '/dashboard/wallet',    Icon: Wallet },
  { name: 'Profile', path: '/dashboard/profile',   Icon: UserCircle },
];

export default function MobileNav() {
  const pathname = usePathname();

  const handleTap = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
  };

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, width: '100%',
      height: '68px',
      background: 'rgba(5,5,5,0.96)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      zIndex: 9999,
    }}>
      <style>{`
        .mob-link { -webkit-tap-highlight-color: transparent; }
        .mob-link:active { opacity: 0.7; }
      `}</style>

      {NAV_ITEMS.map(({ name, path, Icon }) => {
        const isActive = pathname === path;
        return (
          <Link
            key={path}
            href={path}
            onClick={handleTap}
            className="mob-link"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              textDecoration: 'none',
              position: 'relative',
              height: '100%',
            }}
          >
            {isActive && (
              <div style={{
                position: 'absolute', top: 0, left: '50%',
                transform: 'translateX(-50%)',
                width: '28px', height: '2px',
                background: '#00ff88',
                boxShadow: '0 0 8px #00ff88',
                borderRadius: '0 0 3px 3px',
              }} />
            )}

            <div style={{
              width: '34px', height: '34px', borderRadius: '9px',
              background: isActive ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isActive ? 'rgba(0,255,136,0.22)' : 'rgba(255,255,255,0.06)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.18s',
            }}>
              <Icon
                size={15}
                color={isActive ? '#00ff88' : '#444'}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
            </div>

            <span style={{
              fontSize: '9px',
              fontWeight: isActive ? '800' : '500',
              color: isActive ? '#fff' : '#444',
              letterSpacing: isActive ? '0.5px' : '0',
              textTransform: 'uppercase',
              transition: 'all 0.18s',
            }}>
              {name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}