'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Modal, Field, Input, ActionBtn, Result, RED } from './components';
import { deleteUserAccount } from '../actions';

export default function DeleteModal({ user, onClose }) {
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);

  const handle = async () => {
    setLoading(true);
    const r = await deleteUserAccount(user.id);
    setResult(r);
    setLoading(false);
    if (r.success) setTimeout(onClose, 1200);
  };

  return (
    <Modal title="Delete Account" subtitle={user.username} onClose={onClose} accentColor={RED}>
      <div style={{ padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Warning block */}
        <div style={{
          display: 'flex', gap: '14px', alignItems: 'flex-start',
          padding: '16px', borderRadius: '14px',
          background: 'rgba(239,68,68,0.05)',
          border: '1px solid rgba(239,68,68,0.15)',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Trash2 size={16} color={RED} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>
              This is permanent and cannot be undone.
            </div>
            <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
              Deleting <span style={{ color: '#fff', fontWeight: '700' }}>{user.username}</span> will remove their account, all ledger entries, leads, and withdrawals from the database.
            </div>
          </div>
        </div>

        <Field label={`Type "${user.username}" to confirm`}>
          <Input
            type="text"
            placeholder={user.username}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />
        </Field>

        <Result result={result} />

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '12px', borderRadius: '11px', border: '1px solid #222', background: 'transparent', color: '#666', fontSize: '11px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.8px' }}
          >
            Cancel
          </button>
          <ActionBtn
            onClick={handle}
            disabled={confirm !== user.username || loading}
            color={RED}
            fullWidth={false}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 8px' }}>
              {loading ? 'Deleting…' : 'Delete Permanently'}
            </span>
          </ActionBtn>
        </div>
      </div>
    </Modal>
  );
}