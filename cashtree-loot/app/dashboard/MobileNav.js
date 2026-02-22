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

const NEON = '#00ff88';

const NAV_ITEMS = [
  { name: 'Home',    path: '/dashboard',           Icon: LayoutDashboard },
  { name: 'Earn',    path: '/dashboard/campaigns', Icon: Megaphone       },
  { name: 'Network', path: '/dashboard/team',      Icon: Network         },
  { name: 'Wallet',  path: '/dashboard/wallet',    Icon: Wallet          },
  { name: 'Profile', path: '/dashboard/profile',   Icon: UserCircle      },
];

export default function MobileNav() {
  const pathname = usePathname();

  const handleTap = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(12);
  };

  return (
    <>
      <style>{`
        @keyframes navItemIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mob-item {
          -webkit-tap-highlight-color: transparent;
          transition: opacity 0.12s;
        }
        .mob-item:active { opacity: 0.65; }
      `}</style>

      <nav style={{
        position: 'fixed',
        bottom: 0, left: 0, width: '100%',
        background: 'rgba(4,4,6,0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'stretch',
        zIndex: 9999,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: '0 -1px 0 rgba(255,255,255,0.04), 0 -20px 40px rgba(0,0,0,0.6)',
      }}>
        {NAV_ITEMS.map(({ name, path, Icon }, i) => {
          const isActive = pathname === path;
          return (
            <Link
              key={path}
              href={path}
              onClick={handleTap}
              className="mob-item"
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '12px 4px 14px',
                textDecoration: 'none',
                position: 'relative',
                minHeight: '64px',
                animation: `navItemIn 0.3s ease-out ${i * 40}ms both`,
              }}
            >
              {/* Active indicator — top line */}
              <div style={{
                position: 'absolute',
                top: 0, left: '50%',
                transform: 'translateX(-50%)',
                width: isActive ? '28px' : '0px',
                height: '2px',
                background: NEON,
                boxShadow: isActive ? `0 0 10px ${NEON}` : 'none',
                borderRadius: '0 0 4px 4px',
                transition: 'width 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              }} />

              {/* Icon container */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isActive ? `${NEON}12` : 'transparent',
                border: `1px solid ${isActive ? `${NEON}22` : 'transparent'}`,
                transition: 'all 0.2s ease',
                position: 'relative',
              }}>
                {/* Active radial glow behind icon */}
                {isActive && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    borderRadius: '12px',
                    background: `radial-gradient(circle at 50% 50%, ${NEON}18 0%, transparent 70%)`,
                    pointerEvents: 'none',
                  }} />
                )}
                <Icon
                  size={18}
                  color={isActive ? NEON : '#3a3a3a'}
                  strokeWidth={isActive ? 2 : 1.6}
                  style={{ transition: 'color 0.2s, stroke-width 0.2s' }}
                />
              </div>

              {/* Label */}
              <span style={{
                fontSize: '9px',
                fontWeight: isActive ? '800' : '500',
                color: isActive ? '#fff' : '#2e2e2e',
                letterSpacing: isActive ? '0.8px' : '0.3px',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
                lineHeight: 1,
              }}>
                {name}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}