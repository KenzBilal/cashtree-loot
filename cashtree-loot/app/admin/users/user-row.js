'use client';

import { useState } from 'react';
import { toggleUserStatus } from './actions'; // Import the action we just made

export default function UserRow({ user }) {
  const [loading, setLoading] = useState(false);

  // 1. CALCULATE BALANCE
  // Sum up all transactions in the ledger array
  const balance = user.ledger?.reduce((sum, txn) => sum + txn.amount, 0) || 0;

  // 2. HANDLE BAN/UNBAN
  const handleToggle = async () => {
    const confirmMsg = user.is_frozen 
      ? `Unban ${user.username}?` 
      : `Are you sure you want to BAN ${user.username}?`;

    if (!confirm(confirmMsg)) return;

    setLoading(true);
    try {
      await toggleUserStatus(user.id, user.is_frozen);
    } catch (err) {
      alert("Error updating user: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- STYLES ---
  const tdStyle = { padding: '16px 24px', borderBottom: '1px solid #1a1a1a', color: '#e5e5e5', verticalAlign: 'middle' };
  const badgeStyle = (isFrozen) => ({
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '800',
    background: isFrozen ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
    color: isFrozen ? '#f87171' : '#4ade80',
    border: isFrozen ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(34, 197, 94, 0.2)'
  });

  const btnStyle = {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #333',
    background: '#000',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '600',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.5 : 1
  };

  return (
    <tr style={{background: 'transparent', transition: 'background 0.2s'}}>
      {/* IDENTITY */}
      <td style={tdStyle}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <div style={{width: '36px', height: '36px', borderRadius: '8px', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: '#666'}}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{fontWeight: '700', color: '#fff'}}>{user.username}</div>
            <div style={{fontSize: '12px', color: '#666'}}>{user.full_name || 'No Name'}</div>
          </div>
        </div>
      </td>

      {/* CONTACT */}
      <td style={tdStyle}>
        <div style={{fontSize: '13px', fontFamily: 'monospace', color: '#aaa'}}>{user.phone}</div>
        <div style={{fontSize: '11px', color: '#555'}}>{user.upi_id || 'No UPI'}</div>
      </td>

      {/* WALLET */}
      <td style={{...tdStyle, textAlign: 'right'}}>
        <span style={{color: balance >= 0 ? '#fff' : '#f87171', fontWeight: '700'}}>
          ₹{balance.toLocaleString()}
        </span>
      </td>

      {/* STATUS */}
      <td style={{...tdStyle, textAlign: 'center'}}>
        <span style={badgeStyle(user.is_frozen)}>
          {user.is_frozen ? 'BANNED' : 'ACTIVE'}
        </span>
      </td>

      {/* ACTION */}
      <td style={{...tdStyle, textAlign: 'center'}}>
        <button onClick={handleToggle} style={btnStyle} disabled={loading}>
          {loading ? '...' : (user.is_frozen ? 'Unban' : 'Ban User')}
        </button>
      </td>
    </tr>
  );
}