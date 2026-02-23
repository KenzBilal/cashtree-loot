'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Wallet, Shield, Trash2 } from 'lucide-react';
import { Avatar, StatusBadge, NEON, RED, YELLOW } from './components';
import WalletModal  from './WalletModal';
import AccountModal from './AccountModal';
import DeleteModal  from './DeleteModal';

// ── PORTAL DROPDOWN ──
// Renders into document.body so it's never clipped by table overflow or td z-index
function PortalMenu({ anchor, onClose, items }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const menuW = 200;
    let left = rect.right - menuW;
    let top  = rect.bottom + 6 + window.scrollY;
    // Prevent going off left edge
    if (left < 8) left = 8;
    setPos({ top, left });
  }, [anchor]);

  if (!anchor) return null;

  return createPortal(
    <>
      {/* Full-screen invisible overlay to catch outside clicks */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 99990 }}
      />
      {/* Menu */}
      <div style={{
        position: 'absolute',
        top:  pos.top,
        left: pos.left,
        width: '200px',
        background: '#0c0c0c',
        border: '1px solid #1e1e1e',
        borderRadius: '14px',
        padding: '6px',
        boxShadow: '0 24px 48px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04)',
        zIndex: 99991,
        animation: 'menuIn 0.18s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <style>{`
          @keyframes menuIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
          @keyframes modalIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
          .mnu-item { width:100%; display:flex; align-items:center; gap:10px; padding:10px 12px; background:transparent; border:none; border-radius:9px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; text-align:left; transition:background 0.14s; }
          .mnu-item:hover { background:rgba(255,255,255,0.05) !important; }
          .mnu-item.danger:hover { background:rgba(239,68,68,0.08) !important; }
        `}</style>
        {items.map((item, i) =>
          item === null ? (
            <div key={i} style={{ height: '1px', background: '#1a1a1a', margin: '5px 0' }} />
          ) : (
            <button
              key={i}
              onClick={() => { item.action(); onClose(); }}
              className={`mnu-item ${item.danger ? 'danger' : ''}`}
              style={{ color: item.color }}
            >
              {item.icon}
              {item.label}
            </button>
          )
        )}
      </div>
    </>,
    document.body
  );
}

// ── MAIN ROW ──
export default function UserRow({ user, index }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [modal,      setModal]      = useState(null);
  const btnRef = useRef(null);

  const balance   = user.balance || 0;
  const leadCount = user.leads?.length || 0;
  const joinDate  = new Date(user.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: '2-digit',
  });

  const openMenu  = () => setMenuAnchor(btnRef.current);
  const closeMenu = () => setMenuAnchor(null);

  const MENU_ITEMS = [
    { icon: <Wallet size={14}/>, label: 'Manage Wallet',    action: () => setModal('wallet'),  color: NEON   },
    { icon: <Shield size={14}/>, label: 'Account Controls', action: () => setModal('account'), color: YELLOW },
    null,
    { icon: <Trash2 size={14}/>, label: 'Delete Account',   action: () => setModal('delete'),  color: RED, danger: true },
  ];

  const TD = ({ children, center, right, mono }) => (
    <td style={{
      padding: '14px 16px',
      borderBottom: '1px solid #0d0d0d',
      color: '#ccc',
      verticalAlign: 'middle',
      textAlign: center ? 'center' : right ? 'right' : 'left',
      fontFamily: mono ? 'monospace' : 'inherit',
      animation: `fadeIn 0.3s ease-out ${Math.min(index, 20) * 20}ms both`,
    }}>
      {children}
    </td>
  );

  return (
    <>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)} }
        .usr-3dot { transition: background 0.18s, color 0.18s; }
        .usr-3dot:hover { background: rgba(255,255,255,0.08) !important; color: #fff !important; }
      `}</style>

      <tr className="usr-row">
        {/* User */}
        <TD>
          <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
            <Avatar username={user.username} role={user.role} frozen={user.is_frozen} />
            <div>
              <div style={{ fontWeight: '800', color: '#fff', fontSize: '13px' }}>{user.username}</div>
              <div style={{ fontSize: '11px', color: '#444', fontWeight: '600' }}>{user.full_name || '—'}</div>
            </div>
          </div>
        </TD>

        {/* Contact */}
        <TD>
          <div style={{ fontSize: '12px', color: '#888', fontFamily: 'monospace' }}>{user.phone || '—'}</div>
          <div style={{ fontSize: '11px', color: '#333', marginTop: '2px' }}>{user.upi_id || 'No UPI'}</div>
        </TD>

        {/* Balance */}
        <TD right mono>
          <span style={{ color: balance > 0 ? NEON : '#555', fontWeight: '800', fontSize: '14px', textShadow: balance > 0 ? `0 0 12px ${NEON}33` : 'none' }}>
            ₹{balance.toLocaleString('en-IN')}
          </span>
        </TD>

        {/* Leads */}
        <TD center>
          <span style={{ color: leadCount > 0 ? '#fff' : '#444', fontWeight: '700' }}>{leadCount}</span>
        </TD>

        {/* Status */}
        <TD center>
          <StatusBadge frozen={user.is_frozen} role={user.role} />
        </TD>

        {/* Joined */}
        <TD center>
          <span style={{ fontSize: '12px', color: '#555', fontWeight: '600' }}>{joinDate}</span>
        </TD>

        {/* 3-dot menu */}
        <TD center>
          <button
            ref={btnRef}
            className="usr-3dot"
            onClick={openMenu}
            style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid #2a2a2a',
              color: '#666', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <MoreVertical size={15} />
          </button>

          {menuAnchor && (
            <PortalMenu anchor={menuAnchor} onClose={closeMenu} items={MENU_ITEMS} />
          )}
        </TD>
      </tr>

      {/* MODALS */}
      {modal === 'wallet'  && <WalletModal  user={user} onClose={() => setModal(null)} />}
      {modal === 'account' && <AccountModal user={user} onClose={() => setModal(null)} />}
      {modal === 'delete'  && <DeleteModal  user={user} onClose={() => setModal(null)} />}
    </>
  );
}