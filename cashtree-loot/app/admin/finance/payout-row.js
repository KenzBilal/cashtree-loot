'use client';

import { useState } from 'react';
import { User, Users } from 'lucide-react'; // Make sure to install lucide-react if needed, or remove icons

export default function PayoutRow({ item, actions }) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isUser = item.type === 'USER';

  // --- SMART ACTION HANDLER ---
  const handleAction = async (status) => {
    if (!confirm(status === 'paid' ? `Confirm payment?` : `Reject this request?`)) return;
    setLoading(true);

    try {
      let result;
      if (isUser) {
        // User Logic (Only Pay)
        result = await actions.markLeadAsPaid(item.id);
      } else {
        // Promoter Logic (Pay or Reject + Refund)
        result = await actions.processWithdrawal(item.id, status, item.amount, item.accountId);
      }

      if (!result.success) alert(`Error: ${result.error}`);
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

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.5fr 2fr 1.5fr', 
      padding: '16px 24px', borderBottom: '1px solid #1a1a1a', alignItems: 'center',
      background: 'transparent', transition: 'background 0.2s', fontSize: '13px'
    }}
    onMouseOver={(e) => e.currentTarget.style.background = '#0e0e12'}
    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
    >
      
      {/* 1. TIMELINE */}
      <div>
        <div style={{color: '#fff', fontWeight: '600'}}>
          {new Date(item.date).toLocaleDateString()}
        </div>
        <div style={{color: '#555', fontSize: '11px', marginTop: '2px'}}>
          {new Date(item.date).toLocaleTimeString()}
        </div>
      </div>

      {/* 2. BENEFICIARY */}
      <div>
        <div style={{color: '#fff', fontWeight: '700'}}>
          {item.name}
        </div>
        <div style={{color: '#444', fontSize: '11px', fontFamily: 'monospace'}}>
          {item.details}
        </div>
      </div>

      {/* 3. TYPE BADGE (New) */}
      <div>
         <span style={{
            fontSize: '10px', fontWeight: '700', padding: '4px 8px', borderRadius: '6px',
            border: isUser ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(168, 85, 247, 0.2)',
            background: isUser ? 'rgba(59, 130, 246, 0.1)' : 'rgba(168, 85, 247, 0.1)',
            color: isUser ? '#60a5fa' : '#c084fc', display: 'inline-flex', alignItems: 'center', gap: '4px'
         }}>
            {item.type}
         </span>
      </div>

      {/* 4. BANKING */}
      <div>
         <div style={{fontSize: '16px', fontWeight: '800', color: '#fff', marginBottom: '4px'}}>
            ₹{item.amount.toLocaleString()}
         </div>
         <div onClick={copyUpi} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'}}>
            <span style={{fontFamily: 'monospace', color: copied ? '#00ff88' : '#aaa', fontSize: '11px'}}>
              {item.upi_id}
            </span>
            {copied && <span style={{color: '#00ff88', fontSize: '10px'}}>✓</span>}
         </div>
      </div>

      {/* 5. ACTION BUTTONS */}
      <div style={{textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
        <button 
          onClick={() => handleAction('paid')}
          disabled={loading}
          style={{
            background: '#00ff88', color: '#000', border: 'none', padding: '8px 16px', 
            borderRadius: '8px', fontWeight: '800', fontSize: '11px', cursor: 'pointer',
            opacity: loading ? 0.5 : 1
          }}
        >
          {loading ? '...' : 'PAY'}
        </button>

        {!isUser && (
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
        )}
      </div>

    </div>
  );
}