'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Target,
  CheckCircle2,
  Banknote,
  Users,
  Shield,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

// ── Constants defined ABOVE the component (no hoisting risk) ──
const logoIconStyle = {
  width: '32px',
  height: '32px',
  background: 'rgba(0, 255, 136, 0.1)',
  border: '1px solid rgba(0, 255, 136, 0.2)',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#00ff88',
  fontWeight: '800',
  fontSize: '18px',
  flexShrink: 0,
  boxShadow: '0 0 15px rgba(0, 255, 136, 0.08)',
};

const navItems = [
  { name: 'Overview',   path: '/admin',           icon: <LayoutDashboard size={18} /> },
  { name: 'Campaigns',  path: '/admin/campaigns', icon: <Target size={18} /> },
  { name: 'Approvals',  path: '/admin/leads',     icon: <CheckCircle2 size={18} /> },
  { name: 'Finance',    path: '/admin/finance',   icon: <Banknote size={18} /> },
  { name: 'Promoters',  path: '/admin/users',     icon: <Users size={18} /> },
  { name: 'Audit Logs', path: '/admin/audit',     icon: <Shield size={18} /> },
  { name: 'Inquiries',  path: '/admin/inquiries', icon: <Mail size={18} /> },
  { name: 'Settings',   path: '/admin/settings',  icon: <Settings size={18} /> },
];

export default function AdminSidebar({ adminName, logoutAction }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive check — runs only on client
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close drawer on route change (mobile)
  useEffect(() => {
    if (isMobile) setIsOpen(false);
  }, [pathname, isMobile]);

  return (
    <>
      {/* ── GLOBAL RESPONSIVE STYLES ── */}
      <style jsx global>{`
        :root { --sidebar-width: 260px; }

        .admin-main {
          margin-left: var(--sidebar-width);
          width: calc(100% - var(--sidebar-width));
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (max-width: 1024px) {
          .admin-main {
            margin-left: 0 !important;
            width: 100% !important;
          }
          .content-pad  { padding: 20px !important; }
          .mobile-spacer { display: block !important; }
        }
      `}</style>

      {/* ── MOBILE TOP BAR ── */}
      {isMobile && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          background: 'rgba(5, 5, 5, 0.97)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #1a1a1a',
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 60,
          height: '58px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={logoIconStyle}>C</div>
            <span style={{ color: '#fff', fontWeight: '800', fontSize: '15px', letterSpacing: '-0.3px' }}>
              CashTree Admin
            </span>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid #222',
              color: '#fff',
              cursor: 'pointer',
              borderRadius: '8px',
              padding: '7px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Toggle navigation"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      )}

      {/* ── BACKDROP ── */}
      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 49,
          }}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: '260px',
        height: '100vh',
        background: '#050505',
        borderRight: '1px solid #1a1a1a',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflowY: 'auto',
      }}>

        {/* DESKTOP BRANDING */}
        {!isMobile && (
          <div style={{
            padding: '28px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid #111',
            flexShrink: 0,
          }}>
            <div style={logoIconStyle}>C</div>
            <div>
              <div style={{ color: '#fff', fontWeight: '800', fontSize: '15px', letterSpacing: '-0.3px' }}>
                CashTree
              </div>
              <div style={{ color: '#444', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.2px', marginTop: '2px' }}>
                Network Admin
              </div>
            </div>
          </div>
        )}

        {/* Push content below mobile top bar when open */}
        {isMobile && <div style={{ height: '58px', flexShrink: 0 }} />}

        {/* NAVIGATION */}
        <nav style={{ padding: '12px 0 20px', flex: 1, overflowY: 'auto' }}>
          <div style={{
            padding: '0 24px 10px',
            fontSize: '10px',
            fontWeight: '700',
            color: '#333',
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
          }}>
            Main Menu
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 14px',
                  margin: '2px 12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.18s ease',
                  background: isActive ? 'rgba(0, 255, 136, 0.08)' : 'transparent',
                  color: isActive ? '#00ff88' : '#666',
                  border: isActive
                    ? '1px solid rgba(0, 255, 136, 0.12)'
                    : '1px solid transparent',
                }}
              >
                <span style={{
                  display: 'flex',
                  flexShrink: 0,
                  opacity: isActive ? 1 : 0.55,
                  filter: isActive ? 'drop-shadow(0 0 6px rgba(0,255,136,0.5))' : 'none',
                  transition: 'opacity 0.18s, filter 0.18s',
                }}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
                {isActive && (
                  <span style={{
                    marginLeft: 'auto',
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: '#00ff88',
                    boxShadow: '0 0 6px #00ff88',
                    flexShrink: 0,
                  }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* USER FOOTER */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #111',
          background: '#030303',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '14px',
            padding: '10px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '10px',
            border: '1px solid #111',
          }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              border: '1px solid #2a2a3e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
              flexShrink: 0,
            }}>
              👑
            </div>
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <div style={{
                color: '#fff',
                fontSize: '13px',
                fontWeight: '700',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {adminName || 'Super Admin'}
              </div>
              <div style={{
                color: '#00ff88',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '2px',
              }}>
                <span style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: '#00ff88',
                  display: 'inline-block',
                  boxShadow: '0 0 5px #00ff88',
                }} />
                Online
              </div>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '11px',
                background: 'rgba(255, 68, 68, 0.04)',
                border: '1px solid rgba(255, 68, 68, 0.12)',
                color: '#ff5555',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.18s, border-color 0.18s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 68, 68, 0.25)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 68, 68, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(255, 68, 68, 0.12)';
              }}
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
