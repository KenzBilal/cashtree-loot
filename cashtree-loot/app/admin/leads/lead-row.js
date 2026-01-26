'use client';

import { useState } from 'react';
import { updateLeadStatus } from './actions';

export default function LeadRow({ lead }) {
  const [loading, setLoading] = useState(false);

  // Helper to handle click
  const handleAction = async (status) => {
    if (!confirm(`Are you sure you want to mark this as ${status.toUpperCase()}?`)) return;
    
    setLoading(true);
    try {
      // Pass necessary info to server action
      await updateLeadStatus(
        lead.id, 
        status, 
        lead.campaigns?.payout_amount || 0, 
        lead.accounts?.id
      );
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- STYLES ---
  const tdStyle = { padding: '16px 24px', borderBottom: '1px solid #1a1a1a', color: '#e5e5e5', verticalAlign: 'middle' };
  
  // Dynamic Badge Color
  const getStatusColor = (s) => {
    if (s === 'approved') return { bg: 'rgba(34, 197, 94, 0.1)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.2)' };
    if (s === 'rejected') return { bg: 'rgba(239, 68, 68, 0.1)', text: '#f87171', border: 'rgba(239, 68, 68, 0.2)' };
    return { bg: 'rgba(234, 179, 8, 0.1)', text: '#facc15', border: 'rgba(234, 179, 8, 0.2)' };
  };
  const statusColors = getStatusColor(lead.status);

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
  const approveBtn = { ...btnBase, background: '#14532d', color: '#4ade80', border: '1px solid #166534' };
  const rejectBtn = { ...btnBase, background: '#450a0a', color: '#f87171', border: '1px solid #7f1d1d' };

  return (
    <tr style={{background: 'transparent', transition: 'background 0.2s'}}>
      
      {/* 1. DATE & ID */}
      <td style={tdStyle}>
        <div style={{fontFamily: 'monospace', color: '#888', fontSize: '12px'}}>#{lead.id.slice(0,6)}</div>
        <div style={{fontSize: '12px', color: '#555', marginTop: '4px'}}>
          {new Date(lead.created_at).toLocaleDateString()}
        </div>
      </td>

      {/* 2. CAMPAIGN DETAILS */}
      <td style={tdStyle}>
        <div style={{fontWeight: '700', color: '#fff'}}>{lead.campaigns?.title || 'Unknown'}</div>
        <div style={{fontSize: '12px', color: '#22c55e', fontWeight: 'bold'}}>
          Payout: ₹{lead.campaigns?.payout_amount}
        </div>
      </td>

      {/* 3. PROMOTER INFO */}
      <td style={tdStyle}>
        <div style={{color: '#fff'}}>{lead.accounts?.username}</div>
        <div style={{fontSize: '12px', color: '#666'}}>{lead.accounts?.phone || 'No Phone'}</div>
      </td>

      {/* 4. CUSTOMER DATA (METADATA) */}
      <td style={tdStyle}>
        <div style={{background: '#111', padding: '8px', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace', border: '1px solid #222'}}>
          {Object.entries(lead.metadata || {}).map(([key, value]) => (
            <div key={key}>
              <span style={{color: '#666'}}>{key}:</span> <span style={{color: '#ddd'}}>{value}</span>
            </div>
          ))}
        </div>
      </td>

      {/* 5. STATUS / ACTIONS */}
      <td style={tdStyle}>
        {lead.status === 'pending' ? (
          <div style={{display: 'flex'}}>
            <button 
              onClick={() => handleAction('approved')} 
              style={approveBtn} 
              disabled={loading}
            >
              {loading ? '...' : 'Approve'}
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
          <span style={badgeStyle}>{lead.status}</span>
        )}
      </td>
    </tr>
  );
}