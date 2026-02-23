'use client';

import { useState } from 'react';
import { Modal, Field, Input, ActionBtn, Result, NEON, RED, YELLOW } from './components';
import { toggleUserStatus, updateUserUpi, resetUserPassword, deleteUserAccount } from '../actions';

export default function AccountModal({ user, onClose }) {
  const [upi,           setUpi]           = useState(user.upi_id || '');
  const [password,      setPassword]      = useState('');
  const [showPw,        setShowPw]        = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [loadingKey,    setLoadingKey]    = useState(null);
  const [results,       setResults]       = useState({});
  const [isFrozen,      setIsFrozen]      = useState(user.is_frozen);

  const run = async (key, fn) => {
    setLoadingKey(key);
    const r = await fn();
    setResults(p => ({ ...p, [key]: r }));
    setLoadingKey(null);
    if (r?.success && key === 'freeze') setIsFrozen(f => !f);
    return r;
  };

  const joinDate = new Date(user.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <Modal title="Account Controls" subtitle={user.username} onClose={onClose} accentColor={YELLOW}>
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Profile info — role removed */}
        <div style={{ background: '#000', border: '1px solid #111', borderRadius: '14px', padding: '16px 18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
            {[
              ['Username',  user.username],
              ['Full Name', user.full_name || '—'],
              ['Phone',     user.phone     || '—'],
              ['Joined',    joinDate],
              ['Leads',     user.leads?.length || 0],
              ['UPI',       user.upi_id || '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ color: '#444', fontWeight: '800', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>{k}</div>
                <div style={{ color: '#ccc', fontWeight: '700' }}>{String(v)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Freeze / Unfreeze */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '10px', fontWeight: '800', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Account Status</div>
          <Result result={results.freeze} />
          <ActionBtn
            onClick={() => run('freeze', () => toggleUserStatus(user.id, isFrozen))}
            disabled={loadingKey === 'freeze'}
            color={isFrozen ? NEON : RED}
          >
            {loadingKey === 'freeze' ? 'Processing…' : isFrozen ? '✓ Unfreeze Account' : '🧊 Freeze Account'}
          </ActionBtn>
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

        {/* Danger Zone — Delete */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #1a1a1a', paddingTop: '20px' }}>
          <div style={{ fontSize: '10px', fontWeight: '800', color: RED, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Danger Zone</div>
          <div style={{ fontSize: '12px', color: '#555', lineHeight: '1.6' }}>
            Type <span style={{ color: '#fff', fontFamily: 'monospace' }}>{user.username}</span> to permanently delete this account and all its data.
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
            {loadingKey === 'delete' ? 'Deleting…' : 'Delete Account Permanently'}
          </ActionBtn>
        </div>

      </div>
    </Modal>
  );
}