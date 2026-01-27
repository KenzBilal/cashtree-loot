'use client';

import { useState } from 'react';
import { processPayout } from './actions'; // <--- IMPORT THE SERVER ACTION

export default function PayoutRow({ item }) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- THE NEW ACTION HANDLER ---
  const handleAction = async (status) => {
    // 1. Confirm Intent
    const confirmMsg = status === 'paid' 
      ? `Confirm payout of ₹${item.amount} to ${item.accounts?.username}?`
      : `Reject this request? The money will be refunded to the user.`;
      
    if (!confirm(confirmMsg)) return;
    
    setLoading(true);

    try {
      // 2. Call the Server Action (Securely processes on server)
      // Pass: (Payout ID, New Status, Amount, User ID)
      await processPayout(item.id, status, item.amount, item.account_id);
      
      // Success! (The Server Action handles revalidation/refresh)
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(item.upi_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Styles based on status
  const isPending = item.status === 'pending';
  const statusColors = { pending: '#facc15', paid: '#00ff88', rejected: '#ef4444' };
  const color = statusColors[item.status] || '#888';

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 2fr 1.5fr', 
      padding: '16px 24px', borderBottom: '1px solid #1a1a1a', alignItems: 'center',
      background: 'transparent', transition: 'background 0.2s', fontSize: '13px'
    }}
    onMouseOver={(e) => e.currentTarget.style.background = '#0e0e12'}
    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
    >
      
      {/* 1. TIMELINE */}
      <div>
        <div style={{color: '#fff', fontWeight: '600'}}>
          {new Date(item.created_at).toLocaleDateString()}
        </div>
        <div style={{color: '#555', fontSize: '11px', marginTop: '2px'}}>
          {new Date(item.created_at).toLocaleTimeString()}
        </div>
      </div>

      {/* 2. PROMOTER */}
      <div>
        <div style={{color: '#fff', fontWeight: '700'}}>
          {item.accounts?.username || 'Unknown'}
        </div>
        <div style={{color: '#444', fontSize: '11px', fontFamily: 'monospace'}}>
          {item.accounts?.phone}
        </div>
      </div>

      {/* 3. BANKING */}
      <div>
         <div style={{fontSize: '16px', fontWeight: '800', color: '#fff', marginBottom: '4px'}}>
            ₹{item.amount.toLocaleString()}
         </div>
         <div 
           onClick={copyUpi}
           style={{
             display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
             background: copied ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255,255,255,0.05)', 
             padding: '4px 8px', borderRadius: '6px', border: `1px solid ${copied ? '#00ff88' : '#333'}`
           }}
         >
            <span style={{fontFamily: 'monospace', color: copied ? '#00ff88' : '#aaa', fontSize: '11px'}}>
              {item.upi_id}
            </span>
            <span style={{fontSize: '10px', color: copied ? '#00ff88' : '#666'}}>
              {copied ? '✓' : '❐'}
            </span>
         </div>
      </div>

      {/* 4. ACTION BUTTONS */}
      <div style={{textAlign: 'right'}}>
        {isPending ? (
          <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
            <button 
              onClick={() => handleAction('paid')}
              disabled={loading}
              style={{
                background: '#00ff88', color: '#000', border: 'none', padding: '8px 16px', 
                borderRadius: '8px', fontWeight: '800', fontSize: '11px', cursor: 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              PAY
            </button>
            <button 
              onClick={() => handleAction('rejected')}
              disabled={loading}
              style={{
                background: 'transparent', color: '#ef4444', border: '1px solid #333', padding: '8px 12px', 
                borderRadius: '8px', fontWeight: '800', fontSize: '11px', cursor: 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              X
            </button>
          </div>
        ) : (
          <span style={{
            fontSize: '11px', fontWeight: '800', color: color, textTransform: 'uppercase',
            border: `1px solid ${color}44`, padding: '4px 10px', borderRadius: '6px'
          }}>
            {item.status}
          </span>
        )}
      </div>

    </div>
  );
}