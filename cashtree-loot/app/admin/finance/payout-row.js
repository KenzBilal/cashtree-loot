'use client';

import { useState } from 'react';
import { processPayout } from './actions';

export default function PayoutRow({ item }) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (action) => {
    const msg = action === 'paid' 
      ? "Confirm: Have you sent the money manually?" 
      : "Confirm: Reject this request and refund the user?";
    
    if (!confirm(msg)) return;

    setLoading(true);
    try {
      await processPayout(item.id, action, item.amount, item.account_id);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- STYLES ---
  const tdStyle = { padding: '16px 24px', borderBottom: '1px solid #1a1a1a', color: '#e5e5e5', verticalAlign: 'middle' };
  
  const getStatusColor = (s) => {
    if (s === 'paid') return { bg: 'rgba(34, 197, 94, 0.1)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.2)' };
    if (s === 'rejected') return { bg: 'rgba(239, 68, 68, 0.1)', text: '#f87171', border: 'rgba(239, 68, 68, 0.2)' };
    return { bg: 'rgba(59, 130, 246, 0.1)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.2)' };
  };
  const statusColors = getStatusColor(item.status);

  const badgeStyle = {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '800',
    background: statusColors.bg,
    color: statusColors.text,
    border: `1px solid ${statusColors.border}`,
    textTransform: 'uppercase'
  };

  const btnBase = { padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: 'none', marginRight: '8px' };
  const payBtn = { ...btnBase, background: '#14532d', color: '#4ade80', border: '1px solid #166534' };
  const rejectBtn = { ...btnBase, background: '#450a0a', color: '#f87171', border: '1px solid #7f1d1d' };

  return (
    <tr style={{background: 'transparent', transition: 'background 0.2s'}}>
      
      {/* 1. DATE */}
      <td style={tdStyle}>
        <div style={{fontFamily: 'monospace', color: '#888', fontSize: '12px'}}>#{item.id.slice(0,4)}</div>
        <div style={{fontSize: '12px', color: '#555', marginTop: '4px'}}>
          {new Date(item.created_at).toLocaleDateString()}
        </div>
      </td>

      {/* 2. PROMOTER */}
      <td style={tdStyle}>
        <div style={{fontWeight: '700', color: '#fff'}}>{item.accounts?.username}</div>
        <div style={{fontSize: '12px', color: '#666'}}>{item.accounts?.phone || 'No Phone'}</div>
      </td>

      {/* 3. AMOUNT & UPI */}
      <td style={tdStyle}>
        <div style={{fontSize: '16px', fontWeight: 'bold', color: '#fff'}}>₹{item.amount}</div>
        <div style={{
          marginTop: '4px',
          background: '#111', 
          padding: '4px 8px', 
          borderRadius: '4px', 
          border: '1px solid #222', 
          fontFamily: 'monospace', 
          fontSize: '11px',
          color: '#eab308',
          display: 'inline-block'
        }}>
          UPI: {item.upi_id || 'Not Set'}
        </div>
      </td>

      {/* 4. STATUS / ACTIONS */}
      <td style={tdStyle}>
        {item.status === 'pending' ? (
          <div style={{display: 'flex'}}>
            <button 
              onClick={() => handleAction('paid')} 
              style={payBtn} 
              disabled={loading}
            >
              {loading ? '...' : 'Mark Paid'}
            </button>
            <button 
              onClick={() => handleAction('rejected')} 
              style={rejectBtn} 
              disabled={loading}
            >
              {loading ? '...' : 'Reject'}
            </button>
          </div>
        ) : (
          <span style={badgeStyle}>{item.status}</span>
        )}
      </td>
    </tr>
  );
}