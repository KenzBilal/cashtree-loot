'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Megaphone,
  Network,
  Wallet,
  ClipboardList,
  UserCircle,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Overview',     path: '/dashboard',           Icon: LayoutDashboard },
  { name: 'Campaigns',    path: '/dashboard/campaigns', Icon: Megaphone },
  { name: 'Network',      path: '/dashboard/team',      Icon: Network },
  { name: 'Finance',      path: '/dashboard/wallet',    Icon: Wallet },
  { name: 'Activity Log', path: '/dashboard/leads',     Icon: ClipboardList },
  { name: 'Profile',      path: '/dashboard/profile',   Icon: UserCircle },
];

export default function Sidebar({ username }) {
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
        .sb-link { transition: background 0.18s, border-color 0.18s; }
        .sb-link:hover:not(.sb-active) { background: rgba(255,255,255,0.03) !important; }
        .sb-link:hover:not(.sb-active) .sb-lbl { color: #bbb !important; }
        .sb-link:hover:not(.sb-active) .sb-ibox { border-color: rgba(255,255,255,0.1) !important; }
      `}</style>

      {/* ── Brand Block with Avatar (Image 1 style) ── */}
      <div style={{
        padding: '26px 20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', gap: '14px',
      }}>

        {/* White circle + dark green ring + green dot */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {/* Outer ring */}
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            border: '2.5px solid #1c4a30',
            padding: '3px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* White circle */}
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%',
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '17px', fontWeight: '900', color: '#000',
            }}>
              {username?.[0]?.toUpperCase() || 'P'}
            </div>
          </div>
          {/* Green online dot */}
          <div style={{
            position: 'absolute', bottom: '1px', right: '1px',
            width: '11px', height: '11px', borderRadius: '50%',
            background: '#00ff88',
            border: '2px solid #050505',
            boxShadow: '0 0 8px rgba(0,255,136,0.8)',
          }} />
        </div>

        <div>
          <div style={{
            fontSize: '14px', fontWeight: '900', color: '#fff',
            letterSpacing: '-0.3px', lineHeight: 1.2,
          }}>
            CashTree
          </div>
          <div style={{
            fontSize: '10px', color: '#333', fontWeight: '700',
            textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '2px',
          }}>
            Promoter Hub
          </div>
        </div>
      </div>

      {/* ── Section Label ── */}
      <div style={{
        padding: '18px 22px 8px',
        fontSize: '9px', fontWeight: '800', color: '#2a2a2a',
        textTransform: 'uppercase', letterSpacing: '1.5px',
      }}>
        Main Menu
      </div>

      {/* ── Nav Links (Image 2 style) ── */}
      <div style={{
        padding: '4px 10px',
        display: 'flex', flexDirection: 'column', gap: '2px',
        flex: 1,
      }}>
        {NAV_ITEMS.map(({ name, path, Icon }) => {
          const isActive = pathname === path;
          return (
            <Link
              key={path}
              href={path}
              className={`sb-link${isActive ? ' sb-active' : ''}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '11px',
                textDecoration: 'none',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(0,255,136,0.14), rgba(0,255,136,0.05))'
                  : 'transparent',
                border: `1px solid ${isActive ? 'rgba(0,255,136,0.16)' : 'transparent'}`,
              }}
            >
              {/* Icon box */}
              <div className="sb-ibox" style={{
                width: '32px', height: '32px', borderRadius: '8px',
                flexShrink: 0,
                background: isActive ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? 'rgba(0,255,136,0.22)' : 'rgba(255,255,255,0.06)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border-color 0.18s',
              }}>
                <Icon
                  size={14}
                  color={isActive ? '#00ff88' : '#555'}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
              </div>

              {/* Label */}
              <span className="sb-lbl" style={{
                fontSize: '13px',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? '#fff' : '#555',
                flex: 1,
                transition: 'color 0.18s',
              }}>
                {name}
              </span>

              {/* Active dot — right side */}
              {isActive && (
                <div style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: '#00ff88',
                  boxShadow: '0 0 8px #00ff88',
                  flexShrink: 0,
                }} />
              )}
            </Link>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div style={{
        padding: '14px 22px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ fontSize: '10px', color: '#222', fontWeight: '700' }}>
          Promoter Dashboard · v2.0
        </div>
      </div>
    </div>
  );
}