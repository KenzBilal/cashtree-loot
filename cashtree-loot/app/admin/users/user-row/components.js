'use client';

import { X } from 'lucide-react';

export const NEON   = '#00ff88';
export const RED    = '#ef4444';
export const YELLOW = '#fbbf24';

export function Avatar({ username, role, frozen }) {
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

export function StatusBadge({ frozen, role }) {
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

export function Modal({ title, subtitle, onClose, children, accentColor = NEON }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#0a0a0a', border: `1px solid ${accentColor}22`, borderRadius: '22px', width: '100%', maxWidth: '440px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'modalIn 0.28s cubic-bezier(0.16,1,0.3,1)', boxShadow: `0 0 60px ${accentColor}11` }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '20px 22px', borderBottom: '1px solid #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#050505', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '900', color: '#fff', marginBottom: '2px' }}>{title}</div>
            {subtitle && <div style={{ fontSize: '11px', color: '#444', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '10px', fontWeight: '800', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</label>
      {children}
    </div>
  );
}

export function Input({ ...props }) {
  return (
    <input
      {...props}
      style={{ width: '100%', background: '#000', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '11px 13px', color: '#fff', fontSize: '13px', fontWeight: '600', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.18s', ...props.style }}
      onFocus={e => e.target.style.borderColor = '#2a2a2a'}
      onBlur={e => e.target.style.borderColor = '#1e1e1e'}
    />
  );
}

export function ActionBtn({ onClick, disabled, color = NEON, children, fullWidth = true }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ width: fullWidth ? '100%' : 'auto', padding: '12px 18px', borderRadius: '11px', border: 'none', background: color, color: color === RED ? '#fff' : (color === '#888' ? '#fff' : '#000'), fontSize: '11px', fontWeight: '900', cursor: disabled ? 'wait' : 'pointer', opacity: disabled ? 0.55 : 1, transition: 'opacity 0.18s, transform 0.12s', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.8px' }}
    >
      {children}
    </button>
  );
}

export function Result({ result }) {
  if (!result) return null;
  const ok = result.success;
  return (
    <div style={{ padding: '10px 14px', borderRadius: '10px', background: ok ? 'rgba(0,255,136,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${ok ? 'rgba(0,255,136,0.2)' : 'rgba(239,68,68,0.2)'}`, fontSize: '12px', fontWeight: '700', color: ok ? NEON : RED }}>
      {ok ? '✓ Done successfully' : `✗ ${result.error}`}
    </div>
  );
}