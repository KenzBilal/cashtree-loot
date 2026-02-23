'use client';

import { useState } from 'react';
import { Modal, Field, Input, ActionBtn, Result, NEON, RED } from './components';
import { creditUserWallet, deductUserWallet, resetUserBalance } from '../actions';

export default function WalletModal({ user, onClose }) {
  const [tab,          setTab]          = useState('credit');
  const [amount,       setAmount]       = useState('');
  const [reason,       setReason]       = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [loading,      setLoading]      = useState(false);
  const [result,       setResult]       = useState(null);
  const [localBalance, setLocalBalance] = useState(user.balance || 0);
  const [localLedger,  setLocalLedger]  = useState(user.ledger  || []);

  const switchTab = (t) => { setTab(t); setResult(null); setAmount(''); setReason(''); setResetConfirm(''); };

  const handleCreditDeduct = async () => {
    setLoading(true); setResult(null);
    const fn    = tab === 'credit' ? creditUserWallet : deductUserWallet;
    const r     = await fn(user.id, amount, reason);
    setResult(r);
    setLoading(false);
    if (r.success) {
      const delta = parseFloat(amount) * (tab === 'credit' ? 1 : -1);
      setLocalBalance(b => b + delta);
      setLocalLedger(prev => [{
        amount: delta,
        created_at: new Date().toISOString(),
        type: tab === 'credit' ? 'manual_credit' : 'manual_deduction',
        description: reason?.trim() || (tab === 'credit' ? 'Manual credit by admin' : 'Manual deduction by admin'),
      }, ...prev]);
      setAmount(''); setReason('');
    }
  };

  const handleReset = async () => {
    setLoading(true); setResult(null);
    const r = await resetUserBalance(user.id);
    setResult(r);
    setLoading(false);
    if (r.success) {
      setLocalLedger(prev => [{
        amount: -localBalance,
        created_at: new Date().toISOString(),
        type: 'admin_reset',
        description: 'Admin balance reset to zero',
      }, ...prev]);
      setLocalBalance(0);
      setResetConfirm('');
    }
  };

  const TABS = [
    ['credit',  'Credit'],
    ['deduct',  'Deduct'],
    ['reset',   'Reset'],
    ['history', 'History'],
  ];

  return (
    <Modal title="Wallet Control" subtitle={user.username} onClose={onClose}>
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* Balance display */}
        <div style={{ background: '#000', border: '1px solid #111', borderRadius: '14px', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#444', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Current Balance</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: NEON, letterSpacing: '-1px', textShadow: `0 0 20px ${NEON}44` }}>
              ₹{localBalance.toLocaleString('en-IN')}
            </div>
          </div>
          <div style={{ fontSize: '10px', color: '#333', fontWeight: '700', textAlign: 'right' }}>
            {localLedger.length} transactions
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#050505', padding: '3px', borderRadius: '11px', border: '1px solid #111', gap: '3px' }}>
          {TABS.map(([k, l]) => (
            <button key={k} onClick={() => switchTab(k)} style={{
              flex: 1, padding: '9px 4px', borderRadius: '8px', border: 'none',
              background: tab === k ? '#1a1a1a' : 'transparent',
              color: tab === k ? (k === 'reset' ? RED : '#fff') : '#555',
              fontWeight: '800', fontSize: '10px', cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '0.6px',
              fontFamily: 'inherit', transition: 'all 0.18s',
            }}>
              {l}
            </button>
          ))}
        </div>

        {/* Credit / Deduct */}
        {(tab === 'credit' || tab === 'deduct') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Field label="Amount (₹)">
              <Input type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
            </Field>
            <Field label="Reason">
              <Input type="text" placeholder={tab === 'credit' ? 'Bonus, correction…' : 'Penalty, clawback…'} value={reason} onChange={e => setReason(e.target.value)} />
            </Field>
            <Result result={result} />
            <ActionBtn onClick={handleCreditDeduct} disabled={loading || !amount} color={tab === 'credit' ? NEON : RED}>
              {loading ? 'Processing…' : tab === 'credit' ? '+ Credit Wallet' : '− Deduct Wallet'}
            </ActionBtn>
          </div>
        )}

        {/* Reset tab */}
        {tab === 'reset' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', fontSize: '12px', color: '#888', lineHeight: '1.6' }}>
              This will zero out <span style={{ color: '#fff', fontWeight: '700' }}>{user.username}</span>'s balance by inserting a negative ledger entry of{' '}
              <span style={{ color: RED, fontWeight: '900' }}>₹{localBalance.toLocaleString('en-IN')}</span>.
              This cannot be undone.
            </div>
            <Field label={`Type "${user.username}" to confirm`}>
              <Input
                type="text"
                placeholder={user.username}
                value={resetConfirm}
                onChange={e => setResetConfirm(e.target.value)}
              />
            </Field>
            <Result result={result} />
            <ActionBtn
              onClick={handleReset}
              disabled={loading || resetConfirm !== user.username || localBalance === 0}
              color={RED}
            >
              {loading ? 'Resetting…' : localBalance === 0 ? 'Balance Already Zero' : 'Reset Balance to Zero'}
            </ActionBtn>
          </div>
        )}

        {/* History */}
        {tab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
            {localLedger.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#333', fontSize: '13px', fontWeight: '700' }}>No transactions yet.</div>
            ) : [...localLedger].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((tx, i) => {
              const pos  = tx.amount >= 0;
              const date = new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#000', border: '1px solid #111', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#ccc', marginBottom: '2px' }}>{tx.description || tx.type}</div>
                    <div style={{ fontSize: '10px', color: '#444', fontWeight: '600' }}>{date}</div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '900', color: pos ? NEON : RED }}>
                    {pos ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
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