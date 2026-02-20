'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Wallet, Shield, Lock, Trash2, X, ChevronRight } from 'lucide-react';
import {
  toggleUserStatus,
  creditUserWallet,
  deductUserWallet,
  updateUserRole,
  updateUserUpi,
  deleteUserAccount,
  resetUserPassword,
} from './actions';

const NEON    = '#00ff88';
const RED     = '#ef4444';
const YELLOW  = '#fbbf24';

// ── HELPERS ──
function Avatar({ username, role, frozen }) {
  const color = frozen ? RED : role === 'admin' ? YELLOW : NEON;
  return (
    <div style={{
      width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
      background: '#111', border: `1px solid ${color}33`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '15px', fontWeight: '900', color,
      boxShadow: `0 0 8px ${color}22`,
    }}>
      {username?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

function StatusBadge({ frozen, role }) {
  if (role === 'admin') return (
    <span style={{ padding: '3px 9px', borderRadius: '20px', fontSize: '9px', fontWeight: '900', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: YELLOW, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      Admin
    </span>
  );
  return (
    <span style={{ padding: '3px 9px', borderRadius: '20px', fontSize: '9px', fontWeight: '900', background: frozen ? 'rgba(239,68,68,0.08)' : 'rgba(0,255,136,0.06)', border: `1px solid ${frozen ? 'rgba(239,68,68,0.2)' : 'rgba(0,255,136,0.15)'}`, color: frozen ? RED : NEON, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {frozen ? 'Frozen' : 'Active'}
    </span>
  );
}

// ── MODAL SHELL ──
function Modal({ title, subtitle, onClose, children, accentColor = NEON }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#0a0a0a', border: `1px solid ${accentColor}22`, borderRadius: '22px', width: '100%', maxWidth: '440px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'modalIn 0.28s cubic-bezier(0.16,1,0.3,1)', boxShadow: `0 0 60px ${accentColor}11` }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div style={{ padding: '20px 22px', borderBottom: '1px solid #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#050505', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '900', color: '#fff', marginBottom: '2px' }}>{title}</div>
            {subtitle && <div style={{ fontSize: '11px', color: '#444', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── FIELD ──
function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '10px', fontWeight: '800', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</label>
      {children}
    </div>
  );
}

// ── INPUT ──
function Input({ ...props }) {
  return (
    <input
      {...props}
      style={{ width: '100%', background: '#000', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '11px 13px', color: '#fff', fontSize: '13px', fontWeight: '600', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.18s', ...props.style }}
      onFocus={e => e.target.style.borderColor = '#2a2a2a'}
      onBlur={e => e.target.style.borderColor = '#1e1e1e'}
    />
  );
}

// ── ACTION BUTTON ──
function ActionBtn({ onClick, disabled, color = NEON, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ flex: 1, padding: '12px', borderRadius: '11px', border: 'none', background: color, color: color === RED ? '#fff' : '#000', fontSize: '11px', fontWeight: '900', cursor: disabled ? 'wait' : 'pointer', opacity: disabled ? 0.6 : 1, transition: 'opacity 0.18s, transform 0.18s', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.8px' }}
    >
      {children}
    </button>
  );
}

// ── RESULT MESSAGE ──
function Result({ result }) {
  if (!result) return null;
  const ok = result.success;
  return (
    <div style={{ padding: '10px 14px', borderRadius: '10px', background: ok ? 'rgba(0,255,136,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${ok ? 'rgba(0,255,136,0.2)' : 'rgba(239,68,68,0.2)'}`, fontSize: '12px', fontWeight: '700', color: ok ? NEON : RED }}>
      {ok ? '✓ Done' : `✗ ${result.error}`}
    </div>
  );
}

// ══════════════════════════════════════════
// WALLET MODAL
// ══════════════════════════════════════════
function WalletModal({ user, onClose }) {
  const [tab, setTab]       = useState('credit'); // credit | deduct | history
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  const balance = user.balance || 0;

  const handle = async () => {
    setLoading(true); setResult(null);
    const fn = tab === 'credit' ? creditUserWallet : deductUserWallet;
    const r  = await fn(user.id, amount, reason);
    setResult(r);
    setLoading(false);
    if (r.success) { setAmount(''); setReason(''); }
  };

  const ledger = user.ledger || [];

  return (
    <Modal title="Wallet Control" subtitle={user.username} onClose={onClose}>
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* Balance display */}
        <div style={{ background: '#000', border: '1px solid #111', borderRadius: '14px', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#444', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Current Balance</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: NEON, letterSpacing: '-1px', textShadow: `0 0 20px ${NEON}44` }}>
              ₹{balance.toLocaleString('en-IN')}
            </div>
          </div>
          <div style={{ fontSize: '10px', color: '#333', fontWeight: '700', textAlign: 'right' }}>
            <div>{ledger.length} transactions</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#050505', padding: '3px', borderRadius: '11px', border: '1px solid #111', gap: '3px' }}>
          {[['credit', 'Credit'], ['deduct', 'Deduct'], ['history', 'History']].map(([k, l]) => (
            <button key={k} onClick={() => { setTab(k); setResult(null); }} style={{ flex: 1, padding: '9px', borderRadius: '8px', border: 'none', background: tab === k ? '#1a1a1a' : 'transparent', color: tab === k ? '#fff' : '#555', fontWeight: '800', fontSize: '10px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.6px', fontFamily: 'inherit', transition: 'all 0.18s' }}>
              {l}
            </button>
          ))}
        </div>

        {/* Credit / Deduct form */}
        {tab !== 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Field label="Amount (₹)">
              <Input type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
            </Field>
            <Field label="Reason">
              <Input type="text" placeholder={tab === 'credit' ? 'Bonus, correction…' : 'Penalty, clawback…'} value={reason} onChange={e => setReason(e.target.value)} />
            </Field>
            <Result result={result} />
            <ActionBtn onClick={handle} disabled={loading} color={tab === 'credit' ? NEON : RED}>
              {loading ? 'Processing…' : tab === 'credit' ? `+ Credit Wallet` : `− Deduct Wallet`}
            </ActionBtn>
          </div>
        )}

        {/* History */}
        {tab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
            {ledger.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#333', fontSize: '13px', fontWeight: '700' }}>No transactions yet.</div>
            ) : [...ledger].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((tx, i) => {
              const positive = tx.amount >= 0;
              const date = new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#000', border: '1px solid #111', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#ccc', marginBottom: '2px' }}>{tx.description || tx.type}</div>
                    <div style={{ fontSize: '10px', color: '#444', fontWeight: '600' }}>{date}</div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '900', color: positive ? NEON : RED }}>
                    {positive ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ══════════════════════════════════════════
// ACCOUNT MODAL
// ══════════════════════════════════════════
function AccountModal({ user, onClose }) {
  const [upi, setUpi]           = useState(user.upi_id || '');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [loadingKey, setLoadingKey] = useState(null);
  const [results, setResults]   = useState({});

  const run = async (key, fn) => {
    setLoadingKey(key);
    const r = await fn();
    setResults(p => ({ ...p, [key]: r }));
    setLoadingKey(null);
  };

  const joinDate = new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Modal title="Account Controls" subtitle={user.username} onClose={onClose} accentColor={YELLOW}>
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Profile card */}
        <div style={{ background: '#000', border: '1px solid #111', borderRadius: '14px', padding: '16px 18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
            {[
              ['Username',  user.username],
              ['Full Name', user.full_name || '—'],
              ['Phone',     user.phone     || '—'],
              ['Role',      user.role],
              ['Joined',    joinDate],
              ['Leads',     user.leads?.length || 0],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ color: '#444', fontWeight: '800', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>{k}</div>
                <div style={{ color: '#ccc', fontWeight: '700' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Freeze / Unfreeze */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '10px', fontWeight: '800', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Account Status</div>
          <Result result={results.freeze} />
          <ActionBtn
            onClick={() => run('freeze', () => toggleUserStatus(user.id, user.is_frozen))}
            disabled={loadingKey === 'freeze'}
            color={user.is_frozen ? NEON : RED}
          >
            {loadingKey === 'freeze' ? 'Processing…' : user.is_frozen ? '✓ Unfreeze Account' : '🧊 Freeze Account'}
          </ActionBtn>
        </div>

        {/* Role */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '10px', fontWeight: '800', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Role</div>
          <Result result={results.role} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <ActionBtn onClick={() => run('role', () => updateUserRole(user.id, 'admin'))} disabled={loadingKey === 'role' || user.role === 'admin'} color={YELLOW}>
              Make Admin
            </ActionBtn>
            <ActionBtn onClick={() => run('role', () => updateUserRole(user.id, 'user'))} disabled={loadingKey === 'role' || user.role === 'user'} color="#888">
              Demote User
            </ActionBtn>
          </div>
        </div>

        {/* UPI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Field label="Update UPI ID">
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input type="text" placeholder="username@okaxis" value={upi} onChange={e => setUpi(e.target.value)} />
              <button
                onClick={() => run('upi', () => updateUserUpi(user.id, upi))}
                disabled={loadingKey === 'upi'}
                style={{ padding: '11px 16px', background: '#1a1a1a', border: '1px solid #222', borderRadius: '10px', color: '#fff', fontWeight: '800', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.6px' }}
              >
                Save
              </button>
            </div>
          </Field>
          <Result result={results.upi} />
        </div>

        {/* Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Reset Password</div>
            <button onClick={() => setShowPw(p => !p)} style={{ background: 'none', border: 'none', color: '#555', fontSize: '11px', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit' }}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
          {showPw && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
                <button
                  onClick={() => run('password', () => resetUserPassword(user.id, password))}
                  disabled={loadingKey === 'password'}
                  style={{ padding: '11px 16px', background: '#1a1a1a', border: '1px solid #222', borderRadius: '10px', color: '#fff', fontWeight: '800', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.6px' }}
                >
                  Set
                </button>
              </div>
              <Result result={results.password} />
            </div>
          )}
        </div>

        {/* Delete */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #1a1a1a', paddingTop: '20px' }}>
          <div style={{ fontSize: '10px', fontWeight: '800', color: RED, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Danger Zone</div>
          <div style={{ fontSize: '12px', color: '#555', lineHeight: '1.6' }}>
            Type <span style={{ color: '#fff', fontFamily: 'monospace' }}>{user.username}</span> to confirm permanent deletion.
          </div>
          <Input
            type="text"
            placeholder={`Type "${user.username}" to confirm`}
            value={deleteConfirm}
            onChange={e => setDeleteConfirm(e.target.value)}
          />
          <Result result={results.delete} />
          <ActionBtn
            onClick={() => run('delete', () => deleteUserAccount(user.id))}
            disabled={deleteConfirm !== user.username || loadingKey === 'delete'}
            color={RED}
          >
            {loadingKey === 'delete' ? 'Deleting…' : '🗑 Delete Account Permanently'}
          </ActionBtn>
        </div>

      </div>
    </Modal>
  );
}

// ══════════════════════════════════════════
// MAIN USER ROW
// ══════════════════════════════════════════
export default function UserRow({ user, index }) {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [modal, setModal]         = useState(null); // null | 'wallet' | 'account'
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const balance   = user.balance || 0;
  const leadCount = user.leads?.length || 0;
  const joinDate  = new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });

  const TD = ({ children, center, right, mono }) => (
    <td style={{
      padding: '14px 16px',
      borderBottom: '1px solid #0d0d0d',
      color: '#ccc',
      verticalAlign: 'middle',
      textAlign: center ? 'center' : right ? 'right' : 'left',
      fontFamily: mono ? 'monospace' : 'inherit',
      animation: `fadeIn 0.3s ease-out ${index * 20}ms both`,
    }}>
      {children}
    </td>
  );

  const MENU_ITEMS = [
    { icon: <Wallet size={14}/>,  label: 'Manage Wallet',    action: () => { setModal('wallet');  setMenuOpen(false); }, color: NEON },
    { icon: <Shield size={14}/>,  label: 'Account Controls', action: () => { setModal('account'); setMenuOpen(false); }, color: YELLOW },
    null, // divider
    { icon: <Trash2 size={14}/>,  label: 'Delete Account',   action: () => { setModal('account'); setMenuOpen(false); }, color: RED, danger: true },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        .usr-row:hover td { background: rgba(255,255,255,0.01) !important; }
        .usr-3dot:hover { background: rgba(255,255,255,0.08) !important; color: #fff !important; }
        .usr-menu-item:hover { background: rgba(255,255,255,0.04) !important; }
        .usr-menu-item.danger:hover { background: rgba(239,68,68,0.08) !important; }
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
          <div style={{ position: 'relative', display: 'inline-block' }} ref={menuRef}>
            <button
              className="usr-3dot"
              onClick={() => setMenuOpen(o => !o)}
              style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'transparent', border: '1px solid #1a1a1a', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s' }}
            >
              <MoreVertical size={15} />
            </button>

            {menuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                background: '#0c0c0c', border: '1px solid #1e1e1e',
                borderRadius: '14px', padding: '6px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
                zIndex: 9999, minWidth: '190px',
                animation: 'slideIn 0.18s ease-out',
              }}>
                {MENU_ITEMS.map((item, i) =>
                  item === null ? (
                    <div key={i} style={{ height: '1px', background: '#111', margin: '5px 0' }} />
                  ) : (
                    <button
                      key={i}
                      onClick={item.action}
                      className={`usr-menu-item ${item.danger ? 'danger' : ''}`}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 12px', background: 'transparent', border: 'none',
                        borderRadius: '9px', color: item.color, fontSize: '13px', fontWeight: '700',
                        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                        transition: 'background 0.15s',
                      }}
                    >
                      {item.icon} {item.label}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </TD>
      </tr>

      {/* MODALS */}
      {modal === 'wallet'  && <WalletModal  user={user} onClose={() => setModal(null)} />}
      {modal === 'account' && <AccountModal user={user} onClose={() => setModal(null)} />}
    </>
  );
}