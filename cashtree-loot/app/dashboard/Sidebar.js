'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { name: 'Dashboard',    path: '/dashboard',           icon: '🏠' },
  { name: 'Campaigns',    path: '/dashboard/campaigns', icon: '🔥' },
  { name: 'Network',      path: '/dashboard/team',      icon: '🕸' },
  { name: 'Finance',      path: '/dashboard/wallet',    icon: '💰' },
  { name: 'Activity Log', path: '/dashboard/leads',     icon: '📋' },
  { name: 'Profile',      path: '/dashboard/profile',   icon: '👤' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '260px', height: '100vh',
      background: '#050505',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
      zIndex: 50,
    }}>
      <style>{`
        .sb-link { transition: background 0.18s; }
        .sb-link:hover:not(.sb-active) { background: rgba(255,255,255,0.03) !important; }
        .sb-link:hover:not(.sb-active) .sb-icon  { border-color: rgba(255,255,255,0.12) !important; }
        .sb-link:hover:not(.sb-active) .sb-lbl   { color: #fff !important; }
      `}</style>

      {/* Brand */}
      <div style={{
        padding: '22px 20px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: '#00ff88', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', fontWeight: '900', color: '#000',
          boxShadow: '0 0 16px rgba(0,255,136,0.28)',
        }}>
          C
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '900', color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
            CashTree
          </div>
          <div style={{ fontSize: '10px', color: '#3a3a3a', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '3px' }}>
            Promoter Hub
          </div>
        </div>
      </div>

      {/* Section label */}
      <div style={{ padding: '20px 20px 8px', fontSize: '9px', fontWeight: '800', color: '#2e2e2e', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
        Main Menu
      </div>

      {/* Nav */}
      <div style={{ padding: '0 10px', display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`sb-link${isActive ? ' sb-active' : ''}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '9px 12px', borderRadius: '11px',
                textDecoration: 'none',
                background: isActive ? 'rgba(0,255,136,0.07)' : 'transparent',
                position: 'relative',
              }}
            >
              {/* Active left accent */}
              {isActive && (
                <div style={{
                  position: 'absolute', left: 0, top: '18%', bottom: '18%',
                  width: '3px', borderRadius: '0 3px 3px 0',
                  background: '#00ff88', boxShadow: '0 0 8px #00ff88',
                }} />
              )}

              {/* Icon box */}
              <div className="sb-icon" style={{
                width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
                background: isActive ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? 'rgba(0,255,136,0.22)' : 'rgba(255,255,255,0.06)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '15px', transition: 'border-color 0.18s',
              }}>
                {item.icon}
              </div>

              {/* Label */}
              <span className="sb-lbl" style={{
                fontSize: '13px',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? '#fff' : '#555',
                transition: 'color 0.18s',
              }}>
                {item.name}
              </span>

              {/* Active dot */}
              {isActive && (
                <div style={{
                  marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%',
                  background: '#00ff88', boxShadow: '0 0 6px #00ff88',
                }} />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ fontSize: '10px', color: '#2a2a2a', fontWeight: '700' }}>
          Promoter Dashboard · v2.0
        </div>
      </div>
    </div>
  );
}