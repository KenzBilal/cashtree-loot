'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

const NEON = '#00ff88';

export default function PayoutRow({ item, actions, index }) {
  const [status, setStatus] = useState('IDLE'); // IDLE | CONFIRMING | LOADING
  const [copied, setCopied] = useState(false);

  const isUser = item.type === 'USER';
  const typeColor = isUser ? '#3b82f6' : '#a855f7';

  // ── UPI DEEP LINK ──
  const generateDeepLink = () => {
    const payeeName = encodeURIComponent(item.name.replace(/[^a-zA-Z0-9 ]/g, ''));
    const formattedAmount = parseFloat(item.amount).toFixed(2);
    const note = encodeURIComponent(
      isUser
        ? `CashTree Cashback - Ref #${item.id.slice(0, 4)}`
        : `CashTree Payout - ${item.name}`
    );
    return `upi://pay?pa=${item.upi_id}&pn=${payeeName}&am=${formattedAmount}&cu=INR&tn=${note}`;
  };

  // ── HANDLERS ──
  const handlePayClick = () => {
    window.open(generateDeepLink(), '_blank');
    setStatus('CONFIRMING');
  };

  const handleMarkAsDone = async () => {
    setStatus('LOADING');
    try {
      const result = isUser
        ? await actions.markLeadAsPaid(item.id)
        : await actions.processWithdrawal(item.id, 'paid', item.amount, item.accountId);

      if (!result.success) {
        alert(`Error: ${result.error}`);
        setStatus('CONFIRMING');
      }
    } catch (err) {
      alert(`System Error: ${err.message}`);
      setStatus('CONFIRMING');
    }
  };

  const handleReject = async () => {
    if (!confirm('Reject this request? Money will be refunded to wallet.')) return;
    setStatus('LOADING');
    await actions.processWithdrawal(item.id, 'rejected', item.amount, item.accountId);
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(item.upi_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dateStr = new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const timeStr = new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isConfirming = status === 'CONFIRMING';
  const isLoading    = status === 'LOADING';

  return (
    <div style={{
      borderBottom: '1px solid #0f0f0f',
      background: isConfirming ? 'rgba(0,255,136,0.03)' : 'transparent',
      transition: 'background 0.2s',
      animation: `fadeIn 0.3s ease-out ${Math.min(index * 30, 300)}ms both`,
    }}>
      <style>{`
        @keyframes fadeIn  { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes glow    { 0%,100% { opacity:1; } 50% { opacity:0.65; } }
        .prow-desktop { display: none !important; }
        .prow-mobile  { display: flex !important; }
        @media (min-width: 640px) {
          .prow-desktop { display: grid !important; }
          .prow-mobile  { display: none !important; }
        }
      `}</style>

      {/* ════ DESKTOP ROW ════ */}
      <div
        className="prow-desktop"
        style={{
          gridTemplateColumns: '120px 1fr 90px 1fr auto',
          padding: '16px 20px',
          alignItems: 'center',
          gap: '12px',
          fontSize: '13px',
        }}
      >
        {/* Date */}
        <div>
          <div style={{ color: '#fff', fontWeight: '700', fontSize: '12px' }}>{dateStr}</div>
          <div style={{ color: '#444', fontSize: '10px', marginTop: '2px', fontFamily: 'monospace' }}>{timeStr}</div>
        </div>

        {/* Beneficiary */}
        <div style={{ minWidth: 0 }}>
          <div style={{ color: '#fff', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.name}
          </div>
          <div style={{ color: '#555', fontSize: '11px', fontFamily: 'monospace', marginTop: '2px' }}>
            {item.details}
          </div>
        </div>

        {/* Type */}
        <div>
          <TypeBadge type={item.type} color={typeColor} />
        </div>

        {/* Banking */}
        <div>
          <div style={{ fontSize: '16px', fontWeight: '900', color: '#fff', marginBottom: '5px', letterSpacing: '-0.5px' }}>
            ₹{item.amount.toLocaleString()}
          </div>
          <div onClick={copyUpi} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontFamily: 'monospace', color: copied ? NEON : '#555', fontSize: '11px', transition: 'color 0.2s' }}>
              {item.upi_id}
            </span>
            {copied && <span style={{ color: NEON, fontSize: '10px', fontWeight: '800' }}>✓</span>}
          </div>
        </div>

        {/* Actions */}
        <ActionButtons
          status={status}
          isUser={isUser}
          isLoading={isLoading}
          isConfirming={isConfirming}
          onPay={handlePayClick}
          onDone={handleMarkAsDone}
          onReject={handleReject}
          onCancel={() => setStatus('IDLE')}
          direction="row"
        />
      </div>

      {/* ════ MOBILE CARD ════ */}
      <div
        className="prow-mobile"
        style={{
          flexDirection: 'column',
          padding: '16px',
          gap: '12px',
        }}
      >
        {/* Top row: name + type + amount */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span style={{ color: '#fff', fontWeight: '800', fontSize: '14px' }}>{item.name}</span>
              <TypeBadge type={item.type} color={typeColor} />
            </div>
            <div style={{ color: '#555', fontSize: '11px', fontFamily: 'monospace' }}>{item.details}</div>
            <div style={{ color: '#444', fontSize: '10px', marginTop: '3px' }}>{dateStr} · {timeStr}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' }}>
              ₹{item.amount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* UPI row */}
        <div
          onClick={copyUpi}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px',
            background: '#0a0a0a',
            border: '1px solid #1a1a1a',
            borderRadius: '10px',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontFamily: 'monospace', color: copied ? NEON : '#777', fontSize: '12px', transition: 'color 0.2s' }}>
            {item.upi_id}
          </span>
          <span style={{ fontSize: '10px', color: copied ? NEON : '#444', fontWeight: '800' }}>
            {copied ? '✓ Copied' : 'TAP TO COPY'}
          </span>
        </div>

        {/* Action buttons */}
        <ActionButtons
          status={status}
          isUser={isUser}
          isLoading={isLoading}
          isConfirming={isConfirming}
          onPay={handlePayClick}
          onDone={handleMarkAsDone}
          onReject={handleReject}
          onCancel={() => setStatus('IDLE')}
          direction="col"
        />
      </div>
    </div>
  );
}

// ── TYPE BADGE ──
function TypeBadge({ type, color }) {
  return (
    <span style={{
      fontSize: '9px', fontWeight: '900', padding: '3px 8px',
      borderRadius: '6px', letterSpacing: '0.5px',
      border: `1px solid ${color}30`,
      background: `${color}12`,
      color,
    }}>
      {type}
    </span>
  );
}

// ── ACTION BUTTONS ──
function ActionButtons({ status, isUser, isLoading, isConfirming, onPay, onDone, onReject, onCancel, direction }) {
  const isCol = direction === 'col';

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCol ? 'center' : 'flex-end', gap: '8px', padding: '8px 0' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round"
          style={{ animation: 'spin 0.8s linear infinite' }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <span style={{ color: '#555', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Processing…
        </span>
      </div>
    );
  }

  if (isConfirming) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: isCol ? 'stretch' : 'flex-end' }}>
        <span style={{ fontSize: '9px', color: '#00ff88', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: isCol ? 'center' : 'right' }}>
          Payment initiated — confirm below
        </span>
        <div style={{ display: 'flex', gap: '6px', flexDirection: isCol ? 'row' : 'row' }}>
          <button
            onClick={onCancel}
            style={{
              flex: isCol ? 1 : undefined,
              background: '#111', color: '#888', border: '1px solid #222',
              padding: '10px 14px', borderRadius: '10px',
              fontSize: '10px', fontWeight: '800', cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onDone}
            style={{
              flex: isCol ? 2 : undefined,
              background: '#00ff88', color: '#000', border: 'none',
              padding: '10px 16px', borderRadius: '10px',
              fontSize: '10px', fontWeight: '900', cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              animation: 'glow 1.5s infinite',
              boxShadow: '0 0 16px rgba(0,255,136,0.3)',
            }}
          >
            ✓ Mark Paid
          </button>
        </div>
      </div>
    );
  }

  // IDLE
  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: isCol ? 'stretch' : 'flex-end' }}>
      {!isUser && (
        <button
          onClick={onReject}
          title="Reject"
          style={{
            background: 'transparent', color: '#ef4444',
            border: '1px solid #2a2a2a',
            padding: '10px 12px', borderRadius: '10px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <X size={14} />
        </button>
      )}
      <button
        onClick={onPay}
        style={{
          flex: isCol ? 1 : undefined,
          background: '#00ff88', color: '#000', border: 'none',
          padding: '10px 18px', borderRadius: '10px',
          fontWeight: '900', fontSize: '11px', cursor: 'pointer',
          textTransform: 'uppercase', letterSpacing: '0.5px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          boxShadow: '0 0 16px rgba(0,255,136,0.2)',
          whiteSpace: 'nowrap',
        }}
      >
        ⚡ Pay Now
      </button>
    </div>
  );
}