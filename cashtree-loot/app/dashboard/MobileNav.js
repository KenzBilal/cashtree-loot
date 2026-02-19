'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { name: 'Home',    path: '/dashboard',           icon: '🏠' },
  { name: 'Cash',    path: '/dashboard/campaigns', icon: '💼' },
  { name: 'Network', path: '/dashboard/team',      icon: '👥' },
  { name: 'Wallet',  path: '/dashboard/wallet',    icon: '💰' },
  { name: 'Profile', path: '/dashboard/profile',   icon: '👤' },
];

const handleTap = () => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(15);
  }
};

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, width: '100%',
      height: '80px',
      background: 'rgba(5,5,5,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'flex-start',
      paddingTop: '14px',
      paddingBottom: 'env(safe-area-inset-bottom, 16px)',
      zIndex: 9999,
      boxShadow: '0 -10px 40px rgba(0,0,0,0.8)',
    }}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.path}
            href={item.path}
            onClick={handleTap}
            style={{
              flex: 1,                          /* ← fixes 25%×5 overflow */
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              position: 'relative',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* Top glow beam */}
            {isActive && (
              <div style={{
                position: 'absolute', top: '-14px',
                width: '36px', height: '3px',
                background: '#00ff88',
                boxShadow: '0 0 12px #00ff88',
                borderRadius: '0 0 4px 4px',
              }} />
            )}

            {/* Radial bg */}
            {isActive && (
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '48px', height: '48px',
                background: 'radial-gradient(circle, rgba(0,255,136,0.14) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none',
              }} />
            )}

            {/* Icon */}
            <div style={{
              fontSize: '22px', marginBottom: '5px',
              filter: isActive ? 'drop-shadow(0 0 7px rgba(0,255,136,0.6))' : 'none',
              transform: isActive ? 'translateY(-3px) scale(1.14)' : 'translateY(0) scale(1)',
              transition: 'all 0.35s cubic-bezier(0.175,0.885,0.32,1.275)',
            }}>
              {item.icon}
            </div>

            {/* Label */}
            <div style={{
              fontSize: '9px',
              fontWeight: isActive ? '800' : '500',
              color: isActive ? '#fff' : '#555',
              letterSpacing: isActive ? '0.5px' : '0',
              textTransform: 'uppercase',
              transition: 'all 0.25s',
            }}>
              {item.name}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}